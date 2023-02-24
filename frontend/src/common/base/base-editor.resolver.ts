import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BaseEditor } from '@common/base/base-editor';
import { Subject } from 'rxjs';

@Injectable()
export abstract class BaseEditorResolver implements Resolve<any>, OnDestroy{

    protected _destroyed = new Subject<boolean>();
    ngOnDestroy(): void {
        this._destroyed.next(true);
		this._destroyed.complete();
    }

    public static lookupFields(): string[]{
        return [...BaseEditor.commonFormFieldNames()];
    }
    abstract resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot);
}
