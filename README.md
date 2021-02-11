# Contributing Images

### Appropriate Image Content

Contributed images should merit annotations to help understand its many parts. If the image  isn't "busy", consider a more appropriate image-sharing service like imgur.com. 

### 1. Create the content directory

Create a new directory under `PROJECT_BASE/pregen` that will hold the image and metadata. The name of the directory will not be visible to users, but should reflect some relation to the content. The directory name should be lowercase and words should be hyphen-delimited. 

For example:
```
mkdir pregen/lots-of-people-to-see
```

### 2. Create the metadata file

Create a file called `metadata.json` in the content directory (from example above `PROJECT_PAGE/pregen/lots-of-people-to-see/metadata.json`). The metadata file must include three keys:
* _title_ - the viewer-visible name of the artwork/page
* _creator_ - the name of creator (ie. artist, photographer, illustrator, etc.)
* _creatorLink_ - ideally the url of the creator's page containing this work; otherwise, the most relevant link referencing the artist falling back on where the original image was located

For example (`pregen/lots-of-people-to-see/metadata.json`):
```
{
    "title": "50 Famous Scientists Fighting to the Death",
    "creator": "Maria Gomez",
    "creatorLink": "https://mariagomezart.com/"
}
```

### 3. Add the source image

Copy the source image into the `public/static/images` directory. The name of the source image basename must be the same as the pregen directory. The image must by a JPEG file and be a maximum of 1920x1920 in size. 

Using the example above, this would be:: `public/static/images/lots-of-people-to-see.jpg`

### 4. Add the _area_-tag files

Every focusable element in the image should have its own file. The filename should reflect the label of the element when hovered/focused. The filename must end with the file suffix `.areas`. Each file should contain a list of one or more HTML `<area>` tags relevant to that element. 

For example:

`Ford Mustang (1978 model).areas`
```
<area shape="rect" coords="34,44,270,350">
<area shape="rect" coords="290,172,333,250">
<area shape="circle" coords="337,300,44">
```

`Honda Odyssey (2017 model).areas`
```
<area shape="rect" coords="270,172,433,257">
```

The filename should represent what the user will see when hovering over the element. Only the _shape_ and _coords_ attributes need to be provided. Other attributes will be ignored. 

### 5. Run the process-content.py script

This script will help prepare the image and metadata for presentation on the site. 

Usage:
```
./process-content.py pregen/<CONTENT_DIRECTORY>
```

This will create a Typescript metadata file the client application can consume and prepare the image and metadata for presentation. The script should output an import line, which is needed for finally adding the image to the site. 

For example:
```
$ ./process-content.py pregen/lots-of-people-to-see
import LotsOfPeopleToSee from '../processed/lots-of-people-to-see/LotsOfPeopleToSee';
```

Take this import line and add it the list of imports in `src/MetadataStore.ts`. Also, add the class name to the metadata store array. 

For example:
```
...
import LotsOfPeopleToSee from '../processed/lots-of-people-to-see/LotsOfPeopleToSee'; <-- add import to import list

export default class MetadataStore {
    metadata: Metadata[];

    constructor() {
        this.metadata = [
            ...
            LotsOfPeopleToSee <-- add class here
        ];
    }
};
```

### 6. Test & Submit
Run `yarn develop` to spin up the test server and validate the image is loading correctly and its annotations are rendered properly. 

If so, submit a pull request against the *main* branch. 

# Updating Images
To add or improve annotations use a flow similar to the one above:

* make any improvements to the metadata file
* make any improvements to existing *areas* files
* add any new *areas* files
* run the `process-content.py` script
* test changes
* submit pull request

# Development

## Available Scripts

In the project directory, you can run:

### `yarn develop`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

