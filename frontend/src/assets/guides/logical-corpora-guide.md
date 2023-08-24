On the main menu, when you hover over the "**Corpora**" item, two new options are getting revealed with the second one being "**Logical Corpora**", linking to a table with all the available logical datasets.

##### Listing

There are some tools that can help you with finding and displaying all the information about the corpora. Above the table, there is a text bar where you can search by the corpus name, and next to it there are some more filtering options. You can view them by clicking the "**Filter**" button.

The available filters for logical corpora are the following:
- **By date:** By giving a date, you can filter based on the date the corpus was added or updated.
- **By creator:** By giving a user name, you can filter only the corpora that belong to that user, if they are not set as private corpora.
- **By usage**: By selecting a use from the dropdown menu, you can filter based on whether the corpus is used for topic modeling or domain classification.
- **By you:** You can check the "Show only mine" option to only view your corpora.

The information being presented in the table, can also be sorted. All the columns that can be sorted or are already sorted, have a corresponding indication on the right side of the column headers. By default, the table is sorted by date in descending order, meaning that the most recent items are getting displayed at the top. Only one sortable column can be used at a time. Also, some of the columns can be hidden or revealed using the **'gear'** button positioned at the right bottom of the table. When you click on it, all the available display columns will be there for you to select using checkboxes.

##### Details panel

When you click on an item, all the available details about it can be viewed on a panel that gets populated on the right side of the table, regardless of the columns you have revealed at the time. From there, you can perform some actions on the selected item, using the corresponding buttons on the top part of the panel. Logical corpora can be renamed, updated, or deleted. Renaming and updating is performed using modals that popup when you click the buttons mentioned above. When you try to delete an item, you will be warned by another modal before you can actually perform the action.

For logical corpora, the available information is the following:
- **Name:** The name of the item, which can be edited on the rename modal.
- **Description:** A short description, which can be edited on the update modal.
- **Created / Updated:** The date in which the item was added or updated.
- **Creator:** The name of the user that added this item.
- **Type:** Shows whether the corpus is raw or logical.
- **Valid For:** Shows whether the corpus is used for topic modeling or domain classification.
- **Access:** Shows whether the item is public to everyone or private. Access can also be set on the update modal.

##### Importing / Creating

Above the listing, on the left side of the filtering options there is a "**Create corpus**" button. When you click it, a modal pops up giving you all the available options for corpus creation.

<img class="mb-3" src="/assets/guides/images/logical-corpus-1.png">

Along with the basic information, you can add one or more raw corpora to merge and form the logical corpus. When you click the "**Add corpus**" button, a list with all the available raw corpora is shown and you can select one or more of them. When you select a corpus, the table on the center of the form populates with the information of the fields of that corpus. On the table, you can select which fields to use and how they will be used on the models trainings based on the type of the fields you select.

A logical corpus field can be one of the following types:

- **Id**
- **Title**
- **Text**
- **Lemmas**
- **Embeddings**
- **Category**

Once everything is set, the "**Review and save**" button at the bottom of the form is now clickable. When you click it, you are able to review the information entered on a separate modal, save it or even go back to the form to make more changes before saving. At any time you can click the "**Cancel**" button to exit out of the form. Nothing will be saved at this case.
