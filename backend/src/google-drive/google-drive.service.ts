import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { Workspace } from '../workspaces/workspace.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  // ─── OAuth client ──────────────────────────────────────────────────────────

  private getOAuthClient() {
    return new google.auth.OAuth2(
      this.config.getOrThrow('GOOGLE_CLIENT_ID'),
      this.config.getOrThrow('GOOGLE_CLIENT_SECRET'),
      this.config.getOrThrow('GOOGLE_REDIRECT_URI'),
    );
  }

  private getAuthenticatedClient(accessToken: string, refreshToken: string) {
    const client = this.getOAuthClient();
    client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    return client;
  }

  // ─── Workspace OAuth management ───────────────────────────────────────────

  getAuthUrl(workspaceId: string): string {
    const client = this.getOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: workspaceId,
    });
  }

  async handleOAuthCallback(code: string, workspaceId: string): Promise<void> {
    const client = this.getOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new BadRequestException('No se recibieron los tokens de acceso de Google');
    }

    // Get user email from Google
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: userInfo } = await oauth2.userinfo.get();

    await this.workspaceRepo.update(workspaceId, {
      googleDriveAccessToken: tokens.access_token,
      googleDriveRefreshToken: tokens.refresh_token,
      googleDriveEmail: userInfo.email ?? null,
    });
  }

  async getStatus(workspaceId: string): Promise<{ connected: boolean; email?: string }> {
    const ws = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      select: ['id', 'googleDriveEmail', 'googleDriveAccessToken'],
    });
    if (!ws || !ws.googleDriveAccessToken) return { connected: false };
    return { connected: true, email: ws.googleDriveEmail ?? undefined };
  }

  async disconnect(workspaceId: string): Promise<void> {
    await this.workspaceRepo.update(workspaceId, {
      googleDriveAccessToken: null,
      googleDriveRefreshToken: null,
      googleDriveEmail: null,
    });
  }

  // ─── Drive client helper ───────────────────────────────────────────────────

  private async getDriveClient(workspaceId: string) {
    const ws = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      select: ['id', 'googleDriveAccessToken', 'googleDriveRefreshToken'],
    });

    if (!ws?.googleDriveAccessToken || !ws?.googleDriveRefreshToken) {
      throw new BadRequestException(
        'Google Drive no está conectado para este workspace. Conéctalo primero en Configuración → Integraciones.',
      );
    }

    const auth = this.getAuthenticatedClient(ws.googleDriveAccessToken, ws.googleDriveRefreshToken);

    // Auto-refresh handler: persist the new access token
    auth.on('tokens', async (newTokens) => {
      if (newTokens.access_token) {
        await this.workspaceRepo.update(workspaceId, {
          googleDriveAccessToken: newTokens.access_token,
        });
      }
    });

    return google.drive({ version: 'v3', auth });
  }

  // ─── Project folder ────────────────────────────────────────────────────────

  async createProjectFolder(
    workspaceId: string,
    projectId: string,
  ): Promise<{ folderId: string; folderUrl: string }> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, workspaceId },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    if (project.driveFolderId) {
      return {
        folderId: project.driveFolderId,
        folderUrl: project.driveFolderUrl ?? `https://drive.google.com/drive/folders/${project.driveFolderId}`,
      };
    }

    const drive = await this.getDriveClient(workspaceId);

    const folder = await drive.files.create({
      requestBody: {
        name: project.name,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id, webViewLink',
    });

    const folderId = folder.data.id!;
    const folderUrl = folder.data.webViewLink ?? `https://drive.google.com/drive/folders/${folderId}`;

    await this.projectRepo.update(projectId, { driveFolderId: folderId, driveFolderUrl: folderUrl });

    return { folderId, folderUrl };
  }

  // ─── Files ─────────────────────────────────────────────────────────────────

  async getFiles(workspaceId: string, projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, workspaceId },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    if (!project.driveFolderId) return [];

    const drive = await this.getDriveClient(workspaceId);

    const res = await drive.files.list({
      q: `'${project.driveFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, size, createdTime, iconLink)',
      orderBy: 'createdTime desc',
    });

    return res.data.files ?? [];
  }

  async uploadFile(
    workspaceId: string,
    projectId: string,
    file: Express.Multer.File,
  ) {
    const { folderId } = await this.createProjectFolder(workspaceId, projectId);
    const drive = await this.getDriveClient(workspaceId);

    const { Readable } = await import('stream');
    const stream = Readable.from(file.buffer);

    const res = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId],
      },
      media: {
        mimeType: file.mimetype,
        body: stream,
      },
      fields: 'id, name, mimeType, webViewLink, size, createdTime, iconLink',
    });

    return res.data;
  }

  async deleteFile(workspaceId: string, projectId: string, fileId: string): Promise<void> {
    // Verify project belongs to workspace
    const project = await this.projectRepo.findOne({
      where: { id: projectId, workspaceId },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    const drive = await this.getDriveClient(workspaceId);
    await drive.files.delete({ fileId });
  }
}
