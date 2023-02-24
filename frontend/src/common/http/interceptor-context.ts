import { InterceptorType } from '@common/http/interceptors/interceptor-type';

export class InterceptorContext {

	// If an Interceptor is added here, it wont be used in this request context.
	excludedInterceptors?: InterceptorType[] = [];
	// If an Interceptor is added here, all requests including requests to external systems will be intercepted.
	// By default only requests to the web application's services will be intercepted.
	interceptAllRequests?: InterceptorType[] = [];

	interceptorParams?: {type: InterceptorType, overrideErrorCodes: number[], serviceEndpoints: string[]}[] = [];
}
