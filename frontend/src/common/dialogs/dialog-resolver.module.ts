import { NgModule } from '@angular/core';
import { DialogResolverService } from '@common/dialogs/dialog-resolver.service';

@NgModule({
	providers: [
		DialogResolverService,
	]
})
export class DialogResolverModule { }
