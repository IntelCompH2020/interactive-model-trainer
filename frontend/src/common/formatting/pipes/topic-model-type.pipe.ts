import { Pipe, PipeTransform } from "@angular/core";
import { TopicModelType } from "@app/core/enum/topic-model.-type.enum";
import { AppEnumUtils } from "@app/core/formatting/enum-utils.service";

@Pipe({
	name: 'dataTableTopicModeTypeFormatter'
})
export class DataTableTopicModelTypeFormatPipe implements PipeTransform {

    constructor(private enumUtils: AppEnumUtils){

    }

	transform(value: TopicModelType): string | null {
		return this.enumUtils.toTopicModelTypeString(value);
	}
}

