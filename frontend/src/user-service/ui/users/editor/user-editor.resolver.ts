import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { UserServiceUser, UserServiceUserContactInfo, UserServiceUserProfile } from '@user-service/core/model/user.model';
import { UserService } from '@user-service/services/http/user.service';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class UserEditorResolver extends BaseEditorResolver{

  constructor(private userService: UserService) {
    super();
  }

  public static lookupFields(): string[]{
    return [
			...BaseEditorResolver.lookupFields(),
            nameof<UserServiceUser>(x => x.name),
            nameof<UserServiceUser>(x => x.profile) + '.' + nameof<UserServiceUserProfile>(x => x.id),
            nameof<UserServiceUser>(x => x.profile) + '.' + nameof<UserServiceUserProfile>(x => x.timezone),
            nameof<UserServiceUser>(x => x.profile) + '.' + nameof<UserServiceUserProfile>(x => x.culture),
            nameof<UserServiceUser>(x => x.profile) + '.' + nameof<UserServiceUserProfile>(x => x.language),
            nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.type),
            nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.value)
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...UserEditorResolver.lookupFields(),
		];
    return this.userService.getSingle(Guid.parse(route.paramMap.get('id')), fields ).pipe(takeUntil(this._destroyed));
  }
}
