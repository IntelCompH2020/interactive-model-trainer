On the main menu, when you hover over the "**Models**" item, two new options are getting revealed with the first one being "**Domain Models**", linking to a table with all the available domain models.

##### Listing

There are some tools that can help you with finding and displaying all the information about the models. Above the table, there is a text bar where you can search by the model name, and next to it there are some more filtering options. You can view them by clicking the "**Filter**" button.

The available filters for topic models are the following:

- **By date:** By giving a date, you can filter based on the date the model was trained or updated.
- **By domain name**: By giving a domain name, you can filter based on the domain the model belongs to.
- **By creator:** By giving a user name, you can filter only the models that belong to that user, if they are not set as private models.
- **By you:** You can check the "Show only mine" option to only view your models.

The information being presented in the table, can also be sorted. All the columns that can be sorted or are already sorted, have a corresponding indication on the right side of the column headers. By default, the table is sorted by date in descending order, meaning that the most recent items are getting displayed at the top. Only one sortable column can be used at a time. Also, some of the columns can be hidden or revealed using the **'gear'** button positioned at the right bottom of the table. When you click on it, all the available display columns will be there for you to select using checkboxes.

##### Details panel

When you click on an item, all the available details about it can be viewed on a panel that gets populated on the right side of the table, regardless of the columns you have revealed at the time. From there, you can perform some actions on the selected item, using the corresponding buttons on the top part of the panel. Domain models can be renamed, updated, cloned or deleted. Renaming and updating is performed using modals that popup when you click the buttons mentioned above. When you try to delete an item, you will be warned by another modal before you can actually perform the action.

For domain models, the available information is the following:
- **Name:** The name of the item, which can be edited on the rename modal.
- **Description:** A short description, which can be edited on the update modal.
- **Domain name:** The domain this model is related with, used to better distinguish between the models.
- **Created / Updated:** The date in which the item was added or updated.
- **Creator:** The name of the user that added this item.
- **Location:** The location of the data file related to the item.
- **Trained Corpus:** The name of the logical corpus used to train the model.
- **Access:** Shows whether the item is public to everyone or private. Access can also be set on the update modal.

##### Importing / Creating

Above the listing, on the left side of the filtering options there is a "**New model**" button. When you click it, a menu pops up giving you all the available options for training new domain models. Specifically, you can train by keywords or category name. Importing of existing trained domain models is not possible.

<img class="mb-3" src="/assets/guides/images/domain-model-1.png">

On the form that pops up, you can set basic information for the model, like the name, the description (if any), the dataset is going to be trained on and the domain name along with all the parameters that are available to change. If you chose to train using keywords, you will have to select keywords from one or more keyword sources using the dropdown list and then clicking on the specific ones you want to include as shown in the figure above.

Regardless of the training method you chose, when ready, you can press "**Create**" to start the training process. During that time, you can view the progress along with logging messages from the service, on a new modal that will popup in a couple of seconds once the training starts. You can close it at any time and open it again by clicking on the corresponding running task indications  that will be showing at the footer of the page. When the training is done, these indicators turn blue. There may be one or more trainings running at the same time. When you hover over the indicators, you will be able to see the name of the model you set before so that you can view the right process status. Once the process is done, you will be able to press "**Finish**" on the progress modal and the indicator will disappear.