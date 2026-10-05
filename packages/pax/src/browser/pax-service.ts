import { ContainerModule } from 'inversify';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { PaxService, paxPath } from '../common/pax-protocol';

export default new ContainerModule(bind => {
    bind(PaxService).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<PaxService>(paxPath);
    }).inSingletonScope();
});
