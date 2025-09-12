# NgCrudKit
CRUD Utility to be used with Angular Material.  

## Requirements
Angular 20, Angular Material 20 and RXJS 7.8 are required for version 0.X.X and 1.X.X.

**Important Considerations:**
Despite being a release it still in early days, use with caution!

## Installation
First, ensure you have Angular Material set up in your project:
```bash
ng add @angular/material
```

Then, install this package via NPM:
```bash
npm install ng-crud-kit
```

Since this is a standalone component, you can import it directly into your component's imports array. You'll also need to ensure **HttpClientModule** and **ReactiveFormsModule** are available in your application's app.config.ts or app.module.ts:
```javascript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule)
  ]
};
```

And that's it! Just use the selectors for the components in your HTML and you're all set!

## ng-crud-table
This component is designed to handle the table view for your records. This table allows users to edit existing records or remove them by displaying two buttons in the last column.

### Usage 
To use this component, import it into your standalone component and use the ```ng-crud-table``` selector in your template. You will need to configure ```editUrl``` to point to the route where your form component is located.
```javascript
import { Component } from '@angular/core';
import { NgCrudTableComponent } from 'ng-crud-table';
import { CrudTableColumns } from 'ng-crud-kit/models';

@Component({
  standalone: true,
  selector: 'app-product-list',
  template: `
    <ng-crud-table
      [title]="'Products'"
      [subtitle]="'Manage your product inventory'"
      [urlEndpoint]="'products'"
      [displayedColumns]="displayedCols"
      [columns]="tableColumns"
      [editUrl]="'products'">
    </ng-crud-table>
  `,
  imports: [NgCrudTableComponent]
})
export class ProductListComponent {
  displayedCols: string[] = ['name', 'price'];

  tableColumns: CrudTableColumns[] = [
    { name: 'name', title: 'Product Name', isSortable: true, isSearchable: true },
    { name: 'price', title: 'Price', isSortable: false, isSearchable: false }
  ];
}
```
### API
#### Inputs
The form is built inside a [Material Card](https://material.angular.dev/components/card/overview) and the table is a [Material Table](https://material.angular.dev/components/table/overview). Some of the inputs are used to design those elements.
|Property|Type|Default|Description|
|--------|----|-------|-----------|
|mode|'auto'\|'manual'|'auto'|Let's you decide wether you want the component to automatically handle the API calls or if you just want to hear the emitters and handle them yourself.|
|tableData|any[]|[]|**Manual mode only**: the data to display in the table.|
|returnBtnUrl|string|'/'|The URL for the top-left return button.|
|returnBtnText|string|'Return to Home'|The text for the return button.|
|returnBtnIcon|string|''|An Angular Material icon name for the return button. If no icon needed, leave blank.|
|addBtnUrl|string|'/items'|The url to navigate when the Add button is clicked, this path is relative to the current route.|
|apiUrl|string|'http://localhost:4200/api/'|**Auto mode only**: the base URL for your backend API.|
|apiEndpoint|string|'items'|**Auto mode only**: the specific endpoint for your resource (e.g., 'users', 'products').|
|filterLabel|string|'Filter'|The label to be displayed at the filter input box|
|displayedColumns|string[]|[]|An array of column names that will be displayed in the table.|
|columns|CrudTableColumns[]|[]|An array defining the table column headers and their behavior. See CrudTableColumns models below.|
|editUrl|string|'items'|The URL which will redirect when the edit button is clicked. The ID will be added to this URL|
|idField|string|'id'|The name of the field to be treated as the ID. Used to generate the edit URL and make the remove call|

#### Outputs
These events are only emitted when ```mode``` is set to ```'manual'```.

|Event|Type|Description|
|-----|----|-----------|
|editRecord|EventEmitter<any>|Emits the ID of the record when the edit button is clicked.|
|removeRecord|EventEmitter<any>|Emits the ID of the record when the remove button is clicked.|

## ng-crud-form
This components builds a form so users can create a new record or update and existing one. 
The component will automatically look for a record ID in the URL. For example, if your route is configured as ```items/:id```, it will use the ID in the URL to fetch the record data from your API. If no ID is present, it will automatically switch to "add record" mode.
### Usage
To use this component, import it into your standalone component and use the ```ng-crud-form``` selector in your template. For example, to create a form to edit a user profile:
```javascript
import { Component } from '@angular/core';
import { NgCrudFormComponent } from 'ng-crud-form';
import { NgCrudFormItem } from 'ng-crud-kit/models';

@Component({
  standalone: true,
  selector: 'app-user-profile-form',
  template: `
    <ng-crud-form
      [title]="'Edit Profile'"
      [subtitle]="'Update your personal information'"
      [urlEndpoint]="'users'"
      [fields]="formFields"
      [redirectOnSaveUrl]="'users'"
      [redirectOnSaveIdField]="'id'">
    </ng-crud-form>
  `,
  imports: [NgCrudFormComponent]
})
export class UserProfileFormComponent {
  formFields: NgCrudFormItem[] = [
    { name: 'firstName', type: 'text', required: true, label: 'First Name' },
    { name: 'lastName', type: 'text', required: true, label: 'Last Name' },
    { name: 'email', type: 'email', required: true, label: 'Email' }
  ];
}
```
### API
#### Inputs
The form is built inside a [Material Card](https://material.angular.dev/components/card/overview) and the table is a [Material Table](https://material.angular.dev/components/table/overview). Some of the inputs are used to design those elements.
|Property|Type|Default|Description|
|--------|----|-------|-----------|
|mode|'auto'\|'manual'|'auto'|Let's you decide wether you want the component to automatically handle the API calls or if you just want to hear the emitters and handle them yourself.|
|title|string|'CRUD'|The main title of the page or form. The form is presented in a Material Card, and this is the title of the card|
|subtitle|string|''|A subtitle to display below the main title. If no subtitle needed, leave blank.|
|returnBtnUrl|string|'/'|The URL for the top-left return button.|
|returnBtnText|string|'Return to Home'|The text for the return button.|
|returnBtnIcon|string|''|An Angular Material icon name for the return button. If no icon needed, leave blank.|
|apiUrl|string|'http://localhost:4200/api/'|**Auto mode only**: the base URL for your backend API.|
|urlEapiEndpointndpoint|string|'items'|**Auto mode only**: the specific endpoint for your resource (e.g., 'users', 'products').|
|redirectOnSaveUrl|string|'items'|After saving a new record the URL which it'll be redirected to. For example if you are in ```/item``` creating a new record, after saving and receiving the ID 5 then it redirects to ```/item/5```.|
|redirectOnSaveIdField|string|'id'|The field returned by the REST API that contains an identifier. This could be id, uuid, regno, etc|
|fields|CrudFormItem[]|[]|An array defining the form fields and their properties. See CrudFormItem model below.|
|formData|[]|null|**Manual mode only** values to be passed to form, for example when in editing mode.|

### Outputs
These events are only emitted when ```mode``` is set to ```'manual'```.

|Event|Type|Description|
|-----|----|-----------|
|saveRecord|EventEmitter<any>|Emits when a new or existing record is saved. The emitted value is the form data.|

## ng-crud-aio
A versatile, all-in-one Angular component for handling common CRUD (Create, Read, Update, Delete) operations. This component is designed to be highly configurable, working out of the box with your REST API or in a manual mode where you handle the API calls yourself.

It comes with two main modes:
* ```auto``` **(default)**: The component handles all API requests (GET, POST, PUT, DELETE) internally, requiring only the API endpoint and form configuration.

* ```manual```: The component emits events for data loading, saving, and deletion, allowing you to manage the API calls and data flow from the parent component.

### Usage
This is the default and simplest way to use the component. It's ideal for a standard CRUD table interface where the component manages all the data. Set your parent component as:
```javascript
import { Component } from '@angular/core';
import { NgCrudAioComponent } from 'ng-crud-aio';
import { CrudFormItem, CrudTableColumns } from 'ng-crud-aio/models';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <ng-crud-aio
      [title]="'User Management'"
      [urlEndpoint]="'users'"
      [fields]="formFields"
      [displayedColumns]="displayedCols"
      [columns]="tableColumns">
    </ng-crud-aio>
  `,
  imports: [NgCrudAioComponent]
})
export class AppComponent {
  // Your API will be called at: 'http://localhost:4200/api/users'
  // using this component.
  
  formFields: CrudFormItem[] = [
    { name: 'name', type: 'text', required: true, label: 'Full Name', defaultValue: '' },
    { name: 'email', type: 'email', required: true, label: 'Email', defaultValue: '' }
  ];

  displayedCols: string[] = ['name', 'email'];

  tableColumns: CrudTableColumns[] = [
    { name: 'name', title: 'User Name', isSortable: true, isSearchable: true },
    { name: 'email', title: 'Email Address', isSortable: false, isSearchable: true }
  ];
}
```
### API
#### Inputs
The form is built inside a [Material Card](https://material.angular.dev/components/card/overview) and the table is a [Material Table](https://material.angular.dev/components/table/overview). Some of the inputs are used to design those elements.
|Property|Type|Default|Description|
|--------|----|-------|-----------|
|mode|'auto'\|'manual'|'auto'|Let's you decide wether you want the component to automatically handle the API calls or if you just want to hear the emitters and handle them yourself.|
|tableData|any[]|[]|**Manual mode only**: the data to display in the table.|
|formData|any[]|[]|**Manual mode only**: the data to be displayed in the form.|
|title|string|'CRUD'|The main title of the page or form. The form is presented in a Material Card, and this is the title of the card|
|subtitle|string|''|A subtitle to display below the main title. If no subtitle needed, leave blank.|
|returnBtnUrl|string|'/'|The URL for the top-left return button.|
|returnBtnText|string|'Return to Home'|The text for the return button.|
|returnBtnIcon|string|''|An Angular Material icon name for the return button. If no icon needed, leave blank.|
|apiUrl|string|'http://localhost:4200/api/'|**Auto mode only**: the base URL for your backend API.|
|apiEndpoint|string|'items'|**Auto mode only**: the specific endpoint for your resource (e.g., 'users', 'products').|
|fields|CrudFormItem[]|[]|An array defining the form fields and their properties. See CrudFormItem model below.|
|displayedColumns|string[]|[]|An array of column names that will be displayed in the table.|
|columns|CrudTableColumns[]|[]|An array defining the table column headers and their behavior. See CrudTableColumns models below.|
|idField|string|'id'|**Auto mode only**: the name of the ID field present in the table. Used, for example, when removing a record which field specifies which record to be removed|

#### Outputs
These events are only emitted when ```mode``` is set to ```'manual'```.

|Event|Type|Description|
|-----|----|-----------|
|editRecord|EventEmitter<any>|Emits when an existing record is requested for editing. The emitted value is the record's ID.|
|saveRecord|EventEmitter<any>|Emits when a new or existing record is saved. The emitted value is the form data.|
|removeRecord|EventEmitter<any>|Emits when a record is requested for removal. The emitted value is the record's ID.|

## Sending Bearer Token
In most cases you'd like to submit a Bearer token or some other authentication via your headers.  
To accomplish this just create an interceptor within you app, if havent yet, and let this interceptor inject the required header for all HTTP calls. This is an example on how to inject a Bearer token stored in the Local Storage:
```javascript
// ./interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
```
And in your ```app.config.ts``` use it in your ```HttpClient``` ```provider```:
```javascript
//all imports go here
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  //other configs go here
  providers: [
    //other providers go here
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

## Models
The component relies on two models to define its structure and behavior.

```CrudFormItem```
This model defines the properties of each input field in your form. They will be used to build elements in a [FormGroup](https://angular.dev/api/forms/FormGroup).

|Property|Type|Required|Description|
|--------|----|--------|-----------|
|name|string|Yes|The name of the form control.|
|type|string|Yes|The input type (e.g., 'text', 'email').|
|label|string|Yes|The display label for the input field.|
|defaultValue|any|No|A default value for the field.|
|required|boolean|No|Sets a Validators.required on the field.|
|options|any[]|No|Options for select/dropdown fields.|

```CrudTableColumns```
This model defines the properties for each column in your table.

|Property|Type|Required|Description|
|--------|----|--------|-----------|
|name|string|Yes|The name of the data property to display in the column.|
|title|string|No|The display name for the column header. Defaults to name if not provided.|
|isSortable|boolean|No|Indicates if the column can be sorted.|
|isSearchable|boolean|No|Indicates if the column's data can be searched.|

## Upcoming
Two separate components to have table and form in different routes, useful for more complex records.

#### License
This component is open-sourced under the MIT license.