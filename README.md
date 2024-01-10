<a name="readme-top"></a>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This the Web Client Project - Image Viewer for Pulsara

I was able to complete the stated requirements in about 4 hours, however despite the project being functional, the feel and usability felt bare and didn't match what I believed a client would enjoy using

As a result I took the time to make some improvements as listed below:
* Dynamic Pagination
* Autocomplete Suggestions in Search Page
* Robust/Custom Searches
* Slightly improved importance filter
* Importance Parameter Persistence
* Minor graphical improvements(hover effect, spinners on load, etc)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [React](https://react.dev/)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
### Getting Started/Rationale

Implementation Flow:
* On page load, image list is fetched and using the download URLs their content is fetch as a blob and a data URL is generated
  Rationale: I considered the option of only fetching the data of current images to be displayed based on filters and pagination, while this will be useful with a large filebase, in this project howver with only 30 images, it would be a detriment to the speed of the system if images have to be refetched every time the current page, filter or max number of images per page was changed
* Data fetched is redrawn into a smaller image size before display
  Rationale: In order to optimise memory space, the sizes of images are reduced for displaying lists. This will be particularly helpful if more images are added
* "Importance" parameter data is stored in local storage on change to facilitate data persistence
  Rationale: More convenient for the user and more robust
* On click of images, a larger version of the image is displayed to user

### Prerequisites

1. (Ignore if already installed) [Install Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Installation

1. Visit Project Link At [Github](https://github.com/mazi-web/pulsara-project)
2. Download Zip Containing Code
   OR
   Clone the repo
   ```sh
   git clone https://github.com/mazi-web/pulsara-project.git
   ```
3. (Unzip project zip if downloaded as zip) and Using a terminal(like VS Studo Code) navigate to the project directory
4. Install NPM packages
   ```sh
   npm install
   ```
5. Run Dev Server
   ```js
   npm run dev
   ```
8. Open provided link in browser
9. Enjoy Image Viewer

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Search:
* The search bar includes auto completion, as you type, the authors who match what you are typing is displayed, you can click on them to immediately add them to your filter
* You may also add custom searches with "enter" key, eg you may search "Al" and every image whose author has "al" in their name is displayed
* After an author filter is added, you may remove them at any time with the "x" next to the filter name

Radio Button Filter
* There are three radio button options "All", "Important", "Unimportant", click any to change which images to display. "All" displays everything

Image List:
* This list will be subject to active filters at any given time
* Click on image to open a modal with more detailed image

Checkbox:
* In list or modal view, you may use the check box to change the "importance" of an image 

Pagination:
* At the bottom of the list view page, you may change the number of images allowed per page
* At the bottom of list view, there are navigation buttons to navigate pages 

Modal:
* Close modal with "x" in top right corner
* At the bottom, you may use the checkboxes to change the "importance" of the image 
* At the bottom of modal view, there are navigation buttons to navigate to next image, please note that you are limited to images currently displayed on that page

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Mazi David - mazi@arizona.edu

Project Link: [Pulsara Image Viewer](https://github.com/mazi-web/pulsara-project)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Vite](https://vitejs.dev/)
* [Tailwind](https://tailwindcss.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
