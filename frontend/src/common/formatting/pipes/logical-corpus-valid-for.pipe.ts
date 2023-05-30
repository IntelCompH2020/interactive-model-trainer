import { Pipe, PipeTransform } from "@angular/core";
import { CorpusValidFor } from "@app/core/enum/corpus-valid-for.enum";
import { AppEnumUtils } from "@app/core/formatting/enum-utils.service";

@Pipe({
	name: 'dataTableLogicalCorpusValidForFormatter'
})
export class DataTableLogicalCorpusValidForFormatPipe implements PipeTransform {

    constructor(private enumUtils: AppEnumUtils){

    }

	transform(value: CorpusValidFor): string | null {
		return this.enumUtils.toCorpusValidForString(value);
	}
}