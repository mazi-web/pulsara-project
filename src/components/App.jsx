import { useEffect, useState } from 'react'
import '../css/App.css'
import pulsaraLogo from '../assets/pulsara_logo.png'
import Spinner from './Spinner'

function App() {
  //State Definitions
  const [filter, setFilter] = useState({
    authorFilter: [],
    importanceFilter: "all"
  })
  const [imageData, setImageData] = useState({
    authors: [],
    images: {}
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [imagesToDisplay, setImagesToDisplay] = useState([])
  const [imagesToDisplayForPage, setImagesToDisplayForPage] = useState([])

  const [cache, setCache] = useState({})
  const importanceFilterValue = ["all", "important", "unimportant"]
  const [searchText, setSearchText] = useState('')

  const [isLoaded, setIsLoaded] = useState(false)
  const [croppedURL, setCroppedURL] = useState({})
  const [modalImage, setModalImage] = useState({})
  const [modalIndex, setModalIndex] = useState(0)
  
  const [maxImagesPerPage, setMaxImagesPerPage] = useState(10)
  //Use Effect to get image array from provided URL(Runs Once on Load)
  useEffect(() => {
    //Local Storage here stores "importance" variable of images
    if(localStorage.getItem("pulsaraProjectDataStore") !== null){
      setCache(JSON.parse(localStorage.getItem("pulsaraProjectDataStore")))
    }
    fetch('https://picsum.photos/v2/list', {
      method: 'GET',
      headers:{
        "Accept": "application/json"
      }
    })
    .then((response) => response.json())
    .then(async (data) => {
      //console.log(data)
      if(localStorage.getItem("pulsaraProjectDataStore") === null){
        let temp = {}
        for(let i of data){
          temp[i.id] = "unimportant"
        }
        localStorage.setItem("pulsaraProjectDataStore", JSON.stringify(temp))
        setCache(temp)
      }
      //Function to get data URLs for each image object using download URL
      let imageURLs = await getAllImageURL(data)
      setImageData((current) => {
        let temp = {
          authors: [],
          images: {}
        }
        for(let i in data){
          if(!temp.images.hasOwnProperty(data[i].author)){
            temp.authors.push(data[i].author)
            temp.images[data[i].author] = []
          }
          temp.images[data[i].author].push({...data[i], imageURL: imageURLs[data[i].id]})
        }
        // console.log(temp)
        // Get "importance" data stored in local storage
        let snapShot = JSON.parse(localStorage.getItem("pulsaraProjectDataStore"))
        for(let i of Object.keys(temp.images)){
          for(let j in temp.images[i]){
            if(snapShot[temp.images[i][j].id]){
              temp.images[i][j].importance = snapShot[temp.images[i][j].id]
            }
          }
        }
        return temp
      })
      if(!isLoaded){
        setIsLoaded(true)
      }
    })
    .catch((error) => {
      console.log("Error: " + error)
    })
  }, [])

  //Use effect to get which images to display based on filters, page number and max number of images per page
  useEffect(() => {
    let tempImagesToDisplay = []
    for(let i of Object.keys(imageData.images)){
      for(let j of imageData.images[i]){
        if(filter.importanceFilter == "all" || j.importance == filter.importanceFilter){
          if(filter.authorFilter.length == 0){
            tempImagesToDisplay.push(j)
          }
          else{
            for(let k of filter.authorFilter){
              if(j.author.toLowerCase().match(k.toLowerCase())){
                tempImagesToDisplay.push(j)
                break
              }
            }
          }
        }
      }
    }
    setImagesToDisplay(tempImagesToDisplay)
    let tempImagesToDisplaySlice = tempImagesToDisplay.slice(currentPage*maxImagesPerPage, (currentPage*maxImagesPerPage)+maxImagesPerPage)
    setImagesToDisplayForPage(tempImagesToDisplaySlice)
    if(tempImagesToDisplaySlice.length == 0){
      setCurrentPage(currentPage !== 0 ? currentPage - 1 : 0)
    }
  }, [filter, imageData, currentPage, maxImagesPerPage])


  //Handle Search Bar Text Input
  const handleSearchTextOnChange = (event) => {
    setSearchText(event.target.value)
  }

  //Handle Importance Filter Change
  const handleRadioChange = (evt) => {
    setFilter((current) => {
      return {...current, importanceFilter: evt.target.value}
    })
    setCurrentPage(0)
  }

  //Handles Search Filter Submit Via Enter Keypress
  const handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      if(searchText.trim() == ""){
        setSearchText("")
      }
      else{
        if(!filter.authorFilter.includes(searchText)){
          setFilter((current) => {
            return {...current, authorFilter: [...current.authorFilter, searchText]}
          })
          setCurrentPage(0)
        }
        setSearchText("")
      }
    }
  }

  //Handle Author Selection
  const setAuthorClick = (author) => {
    if(!filter.authorFilter.includes(author)){
      setFilter((current) => {
        return {...current, authorFilter: [...current.authorFilter, author]}
      })
      setCurrentPage(0)
    }
    setSearchText("")
  }

  //Promise based fuction to pull data URLs for each image
  const getAllImageURL = async (data) => {
    let imageURLs = {}
    let promises = []
    for(let i of data){
      promises.push(fetch(`${i.download_url}`, {
        method: 'GET',
      })
      .then((response) => response.blob())
      .then((blob) => {
        let reader = new FileReader();
        return new Promise(function(resolve, reject) {
          reader.onload = function(e) {
            imageURLs[i.id] = e.target.result
            resolve()
          }
          reader.readAsDataURL(blob);
        })
        
        // const imageUrl = URL.createObjectURL(blob);
        // imageURLs[i.id] = imageUrl
      })
      );
    }
    await Promise.allSettled(promises)
    // console.log(imageURLs)
    return imageURLs
  }

  //Change max number of images per page
  const changeMaxPerPage = (evt) => {
    setMaxImagesPerPage(parseInt(evt.target.value))
    setCurrentPage(0)
  }

  //Handle change of importance of an image
  const handleImportanceUpdate = (evt, id, author) => {
    setCache((current) => {
      let temp = {...current, [parseInt(id)]: evt.target.value}
      localStorage.setItem("pulsaraProjectDataStore", JSON.stringify(temp))
      return temp
    })
    setImageData((current) => {
      for(let i in current.images[author]){
        if(current.images[author][i].id == id){
          current.images[author][i].importance = evt.target.value
          break
        }
      }
      return {...current}
    })
  }

  //Handle Search Filter Removal
  const handleRemoveFilter = (author) => {
    let temp = filter.authorFilter.filter((x) => x !== author)
    setFilter((current) => {
      return {...current, authorFilter: temp}
    })
    setCurrentPage(0)
  }

  //Handles opening the modals
  const openModal = async (value, index) => {
    var modal = document.getElementById("imageModal");

    var modalImg = document.getElementById("imgMod");

    await fetch(`${value.download_url}`, {
      method: 'GET',
    })
    .then((response) => response.blob())
    .then((blob) => {
      let reader = new FileReader();
        return new Promise(function(resolve, reject) {
          reader.onload = function(e) {
            modalImg.src = e.target.result
            resolve()
          }
          reader.readAsDataURL(blob);
        })
    })
    modal.style.display = "flex";
    setModalImage(value)
    setModalIndex(index)
    
    var span = document.getElementsByClassName("close")[0];
    
    span.onclick = function() {
      modal.style.display = "none";
    }
  }

  //Hnadles shrinking image file size
  const shrinkImages = (event, value) => {
    if(document.getElementById(`${value.id}-img`)){
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    canvas.width = 200; // target width
    canvas.height = 200; // target height


    ctx.drawImage(event.target, 
      0, 0, value.width, value.height, 
      0, 0, canvas.width, canvas.height
    );
  // create a new base64 encoding
  let dataURL = canvas.toDataURL();
  setCroppedURL((current) => {
    return {...current, [value.id]: dataURL}
  })
  // document.getElementById(`${value.id}-img`).remove()
  // var resampledImage = new Image();
  // resampledImage.src = dataURL
  // resampledImage.className = "cropped mx-6 my-6"
  // resampledImage.id = `${value.id}-img-crop`
  //if(!croppedURL[value.id]){
  //}
  //resampledImage.onclick = function(){openModal(value, index)}
  //document.getElementById(`${value.id}-container`).prepend(resampledImage)
}
  }
  if(isLoaded){
  return (
    <>
      <div className='flex flex-1 flex-col justify-start items-center px-6 py-12 lg:px-8 roboto'>
        <a href="https://www.pulsara.com/" target="_blank">
          <img src={pulsaraLogo} className="logo" alt="Pulsara logo" />
        </a>
        <h1 className='flex mb-6'>Image Viewer</h1>
        <h2 className='flex mb-6 text-3xl'>Filter Section</h2>
        {/* Author Search Bar */}
        <input id="searchText" type='text' value={searchText} placeholder='Search For Author' onKeyDown={handleKeyPress} onChange={handleSearchTextOnChange} className='relative m-0 mb-4 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:focus:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary' />
        {searchText.length !== 0 && <div className='flex flex-col'>
          {imageData.authors.map((value, index) => {
            if(value.toLowerCase().match(searchText.toLowerCase())){
              return (
              <button key={index} className='mx-4 my-2' onClick={() => setAuthorClick(value)}>
                <p className="text-base text-gray-900 dark:text-white px-4 py-1 border-2 border-solid border-black rounded-md">{value}</p>
              </button>
              )
            }
          })}
          </div>}
        {/* Author Dropdown From Search */}
        {filter.authorFilter.length !== 0 && <div className='flex mb-4 flex-wrap'>
          {filter.authorFilter.map((value, index) => {
            return (<div className='flex' key={index}>
              <p className="text-3xl text-gray-900 dark:text-white mx-4">{value}</p>
              <button onClick={() => handleRemoveFilter(value)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              </button>
            </div>)
          })}
          </div>}
        {/* Author Radio Button Filter */}
        <div className="flex mb-6">
        <div className="flex items-center me-4">
            <input id="allFilter" checked={filter.importanceFilter === importanceFilterValue[0]} type="radio" value={importanceFilterValue[0]} onChange={handleRadioChange} name="importanceRadio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="allFilter" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">All</label>
        </div>
        <div className="flex items-center me-4">
            <input id="importantFilter" checked={filter.importanceFilter === importanceFilterValue[1]} type="radio" value={importanceFilterValue[1]} onChange={handleRadioChange} name="importanceRadio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="importantFilter" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Important</label>
        </div>
        <div className="flex items-center me-4">
            <input id="unimportantFilter" checked={filter.importanceFilter === importanceFilterValue[2]} type="radio" value={importanceFilterValue[2]} onChange={handleRadioChange} name="importanceRadio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="unimportantFilter" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Unimportant</label>
        </div>
        </div>
        {/* Image Containers */}
        <h2 className='flex text-3xl mb-2'>Image Section</h2>
        <div className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pb-5'>
          {imagesToDisplayForPage.map((value, index) => {
              return (
                <div className='flex flex-col items-center' key={index} id={`${value.id}-container`}>
                  {croppedURL[value.id] && <img className="cropped mx-6 mt-6 imgItem" src={croppedURL[value.id]} id={`${value.id}-img-crop`} onClick={() => {openModal(value, index)}}/>}
                  {!document.getElementById(`${value.id}-img-crop`) && <img className="cropped mx-6 my-6 hidden" src={value.imageURL} id={`${value.id}-img`} onLoad={(event) => shrinkImages(event, value, index)}/>}
                  <p className="text-base text-gray-900 dark:text-white mx-4">{value.author}</p>
                  <div className="flex justify-center">
                  <div className="flex items-center me-2">
                      <input id={`${value.id}-check-im-id`} checked={value.importance ? value.importance === "important" : true} type="checkbox" value="important" onChange={(evt) => handleImportanceUpdate(evt, value.id, value.author)} name={`${value.id}-check-im`} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                      <label htmlFor={`${value.id}-check-im-id`} className="ms-1 text-sm font-medium text-gray-900 dark:text-gray-300">Important</label>
                  </div>
                  <div className="flex items-center me-2">
                      <input id={`${value.id}-check-unim-id`} checked={value.importance ? value.importance === "unimportant" : true} type="checkbox" value="unimportant" onChange={(evt) => handleImportanceUpdate(evt, value.id, value.author)} name={`${value.id}-check-unim`} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                      <label htmlFor={`${value.id}-check-unim-id`} className="ms-1 text-sm font-medium text-gray-900 dark:text-gray-300">Unimportant</label>
                  </div>
                  </div>
                </div>
              )
          })}
        </div>
        {/* Pagination */}
        <div className='flex'>
        <button disabled={currentPage === 0} onClick={() => {setCurrentPage((current) => current-1)}}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
        </svg>
        </button>
        <p className="text-4xl text-gray-900 dark:text-white mx-4">{currentPage+1}</p>
        <button disabled={currentPage === (Math.ceil((Object.keys(imagesToDisplay).length/maxImagesPerPage))-1)} onClick={() => {setCurrentPage((current) => current+1)}}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
        </svg>
        </button>

        </div>
        <label htmlFor="maxImagesPerPage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Max Images Per Page</label>
        <select onChange={changeMaxPerPage} id="maxImagesPerPage" className="w-48 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </div>
      {/* The Modal Template */}
        <div id="imageModal" className="modal flex flex-col items-center">
        <span className="close">&times;</span>
        <img className="modal-content" id="imgMod" />
        <p className="text-2xl text-white mx-4">{modalImage.author}</p>
        <div className="flex mx-auto self-center">
        <div className="flex items-center me-4">
            <input id={`${modalImage.id}-checkModal-im-id`} checked={modalImage.importance ? modalImage.importance === "important" : true} type="checkbox" value="important" onChange={(evt) => handleImportanceUpdate(evt, modalImage.id, modalImage.author)} name={`${modalImage.id}-check-im`} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor={`${modalImage.id}-checkModal-im-id`} className="ms-2 text-xl font-medium text-white">Important</label>
        </div>
        <div className="flex items-center me-4">
            <input id={`${modalImage.id}-checkModal-unim-id`} checked={modalImage.importance ? modalImage.importance === "unimportant" : true} type="checkbox" value="unimportant" onChange={(evt) => handleImportanceUpdate(evt, modalImage.id, modalImage.author)} name={`${modalImage.id}-check-unim`} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor={`${modalImage.id}-checkModal-unim-id`} className="ms-2 text-xl font-medium text-white">Unimportant</label>
        </div>
        </div>
        <div className='flex'>
        <button className='mr-4' disabled={modalIndex === 0} onClick={() => {openModal(imagesToDisplayForPage[modalIndex-1], modalIndex-1)}}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
        </svg>
        </button>
        <button disabled={modalIndex+1 > imagesToDisplayForPage.length - 1 } onClick={() => {openModal(imagesToDisplayForPage[modalIndex+1], modalIndex+1)}}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
        </svg>
        </button>
        </div>
      </div>
    </>
  )
  }
  else{
    return (
      <Spinner />
    )
  }
}

export default App
