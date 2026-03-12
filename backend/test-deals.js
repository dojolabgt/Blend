"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const deals_service_1 = require("./src/deals/deals.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const dealsService = app.get(deals_service_1.DealsService);
    const workspaceId = 'd7a949c0-7f72-4c3f-a1c9-f1c4f9ef2880';
    const deals = await dealsService.findAll(workspaceId);
    console.log('--- FOUND DEALS ---');
    console.log(JSON.stringify(deals, null, 2));
    console.log('-------------------');
    await app.close();
}
bootstrap();
//# sourceMappingURL=test-deals.js.map