import { WordListVisibility } from "@app/core/enum/wordlist-visibility.enum";
import { BaseEntity, BaseEntityPersist } from "@common/base/base-entity.model";
import { Moment } from "moment";

export interface Keyword extends BaseEntity {
    name: string;
    description: string;
    visibility: WordListVisibility;
    wordlist: string[];
    creation_date: Moment;
    creator?: string;
    location?: string; 
}

export interface KeywordListPersist extends BaseEntityPersist {
    name: string;
    description: string;
    visibility: WordListVisibility;
    wordlist: string[];
    creation_date: Moment;
    creator?: string;
    location?: string;
}