import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExternalTracingService } from '@app/core/services/http/external-tracing.service';
import { ErrorsComponent } from '@common/modules/errors/errors-component/errors.component';
import { ErrorsHandler } from '@common/modules/errors/errors-handler/errors-handler';
import { ErrorRoutingModule } from '@common/modules/errors/errors-routing/errors-routing.module';
import { ErrorService } from '@common/modules/errors/errors-service/error.service';
import { ServerErrorsInterceptor } from '@common/modules/errors/server-errors-interceptor/server-errors.interceptor';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		ErrorRoutingModule,
	],
	declarations: [
		ErrorsComponent
	],
	providers: [
		ErrorService,
		ExternalTracingService,
		{
			provide: ErrorHandler,
			useClass: ErrorsHandler,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: ServerErrorsInterceptor,
			multi: true
		},
	]
})
export class ErrorsModule { }
