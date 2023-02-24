import { MatDialogConfig } from '@angular/material/dialog';

export class DialogRouteConfig extends MatDialogConfig {
	redirectPath?: string[];
	replaceUrl?: boolean;
}
