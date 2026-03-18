import { redirect } from 'next/navigation';

// Legacy /b/[token] route — all brief flows now live at /d/[token]
export default function BriefLegacyRedirect({ params }: { params: { token: string } }) {
    redirect(`/d/${params.token}`);
}
