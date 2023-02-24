import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Tenant } from '@app/core/model/tenant/tenant.model';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class TenantEditorResolver extends BaseEditorResolver {

  constructor(private tenantService: TenantService) {
    super();
  }

  public static lookupFields(): string[] {
    return [
      ...BaseEditorResolver.lookupFields(),
      nameof<Tenant>(x => x.code),
      nameof<Tenant>(x => x.name)
    ]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
      ...TenantEditorResolver.lookupFields(),
    ];
    return this.tenantService.getSingle(Guid.parse(route.paramMap.get('id')), fields).pipe(takeUntil(this._destroyed));
  }
}
