import { Pipe, PipeTransform } from "@angular/core";
import { DomainModelType } from "@app/core/enum/domain-model-type.enum";
import { AppEnumUtils } from "@app/core/formatting/enum-utils.service";

@Pipe({
	name: 'dataTableDomainModelTypeFormatter'
})
export class DataTableDomainModelTypeFormatPipe implements PipeTransform {

    constructor(private enumUtils: AppEnumUtils){

    }

	transform(value: DomainModelType): string | null {
		return this.enumUtils.toDomainModelTypeString(value);
	}
}

