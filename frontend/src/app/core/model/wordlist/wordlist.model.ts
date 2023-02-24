import { WordListValidFor } from "@app/core/enum/wordlist-valid-for.enum";
import { WordListVisibility as WordListVisibility } from "@app/core/enum/wordlist-visibility.enum";
import { BaseEntity, BaseEntityPersist } from "@common/base/base-entity.model";
import { Moment } from "moment";

export interface WordList extends BaseEntity {
    name: string;
    description: string;
    valid_for: WordListValidFor;
    visibility: WordListVisibility;
    wordlist: string[];

    creator: string;
    location: string;
    creation_date: Moment;
}

export interface WordListPersist extends BaseEntityPersist {
    name: string;
    description: string;
    valid_for: WordListValidFor;
    visibility: WordListVisibility;
    wordlist: string[];

    creator: string;
    location: string;
}