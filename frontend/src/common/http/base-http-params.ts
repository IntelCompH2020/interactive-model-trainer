import { HttpParams } from '@angular/common/http';
import { InterceptorContext } from '@common/http/interceptor-context';

export class BaseHttpParams extends HttpParams {
	interceptorContext?: InterceptorContext;
}
