const body = document.querySelector('body');
const composeButton = document.querySelector("#createMailButton")
const composeForm = document.getElementById("composeForm");
const cancelButton = composeForm.querySelector(".cancel-btn")
const fileAttach = composeForm.querySelector("#Attachfile")
const tmpUpload =  composeForm.querySelector("#tmp-input")
const attachFilePresent = composeForm.querySelector(".attach-present")
const mainViewAlertBox = document.querySelector("#main .mainView-alert-box")
const searchBox = document.querySelector("#main .search-box")
const nanoContent = document.querySelector("#main-nano-wrapper .nano-content")

composeButton.addEventListener("click",(e) => {
    body.classList.remove('show-sidebar', 'show-main-overlay')
    toggleForm();
})

cancelButton.addEventListener("click",(e) => {

  composeForm.reset();
  attachFilePresent.innerHTML = ""
  toggleForm();

})

composeForm.addEventListener("submit",(e) => {

  e.preventDefault();
  mainViewAlertBox.innerHTML = 
  `<div class="alert alert-dark" role="alert">
      <div class="alert-content">Sending ...</div>
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `

  tmpUpload.value = ""
  const formData = new FormData(composeForm);

  axios.post('/mail/send', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then((response) => {

    if(response.data.code != 200)
    {
      
      mainViewAlertBox.innerHTML = 
    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <button class="btn-close" type="button" aria-label="Close" data-bs-dismiss="alert"></button>
        <p style="margin-bottom: 0">${response.data.message}</p>    
      </div
    `
    }
    else
    {
        mainViewAlertBox.innerHTML = 
      `<div class="alert alert-success alert-dismissible fade show" role="alert">
          <button class="btn-close" type="button" aria-label="Close" data-bs-dismiss="alert"></button>
          <p style="margin-bottom: 0">${response.data.message}</p>    
        </div
      `
      composeForm.reset();
      attachFilePresent.innerHTML = ""
      toggleForm();
    }

  })
  .catch((error) => {
    console.log(error)
    mainViewAlertBox.innerHTML = 
    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <button class="btn-close" type="button" aria-label="Close" data-bs-dismiss="alert"></button>
        <p style="margin-bottom: 0">${error.message}</p>    
      </div
    `
  });


})

tmpUpload.addEventListener("change", (e) => {

  let tmpfileList = e.target.files
  let currentAttachFileList = fileAttach.files
  let dataTransfer = new DataTransfer();
  if( currentAttachFileList.length > 0)
  {
    for(let i = 0; i < currentAttachFileList.length; i ++)
    {
      dataTransfer.items.add(currentAttachFileList[i]);
    }
  }
  for(let i = 0; i < tmpfileList.length ; i ++)
  {
    dataTransfer.items.add(tmpfileList[i]);
  }
  fileAttach.files = dataTransfer.files
  uploadAttachFilePresent()
})


searchBox.querySelector(".icon").addEventListener("click",(e) => {

    let currentNano = nanoContent.innerHTML

    nanoContent.innerHTML = `
    <div class="nano-status">
      <div class="loading-mail">
        <div class="spinner-border" role="status">
        
        </div>
        <span class="mt-2">Loading</span>
      </div>
    </div>  
    `

    searchValue = searchBox.querySelector("input").value

    axios.post('/mail/search', {searchValue}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
     if(response.data.code != 200)
    {
      
      mainViewAlertBox.innerHTML = 
    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <button class="btn-close" type="button" aria-label="Close" data-bs-dismiss="alert"></button>
        <p style="margin-bottom: 0">${response.data.message}</p>    
      </div
    `
    }
    else
    {
      if(response.data.mailList)
      {
        let newMailBoxHTML = ``
        for(let i of response.data.mailList)
        {
          newMailBoxHTML += `
            <li class="${i.isReaded} message-item" data-MID ="${i.MID}">
                    <div class="col col-1"><span class="dot"></span>
                    <div class="checkbox-wrapper">
                      <input type="checkbox" id="chk1" />
                      <label for="chk1" class="toggle"></label>
                    </div>
                    <p class="title">${i.senderName}</p><span
                      class="star-toggle glyphicon glyphicon-star-empty"
                    ></span>
                  </div>
                  <div class="col col-2">
                    <div class="subject">${i.title} &nbsp;&ndash;&nbsp;
                      <span class="teaser">${i.body}</span></div>
                    <div class="date">${i.sentDate}</div>
                  </div> 
              </li>
          `
        }
        nanoContent.innerHTML =`
          <ul class="message-list">
            ${newMailBoxHTML}
          </ul>
        `
        addMailDetailLink()
      }
      else
      {
        nanoContent.innerHTML = `
        <div class="nano-status">
            No result found
        </div>  
        `
      }
    } 
  
    })
    .catch((error) => {
      console.log(error)
      mainViewAlertBox.innerHTML = 
      `<div class="alert alert-danger alert-dismissible fade show" role="alert">
          <button class="btn-close" type="button" aria-label="Close" data-bs-dismiss="alert"></button>
          <p style="margin-bottom: 0">${error.message}</p>    
        </div
      `
    });


})

function uploadAttachFilePresent()
{
  attachFilePresent.innerHTML = ""

  let currentAttachFileList = fileAttach.files
 
  for(let i = 0; i < currentAttachFileList.length; i ++)
  {
     let attachFileDiv = document.createElement("div")
    attachFileDiv.classList.add("attach-file")
    let attachFileData = document.createElement("div")
    attachFileData.classList.add("file-data")
    let removeFileBtn = document.createElement("div")
    removeFileBtn.classList.add("close-btn")
    
    attachFileData.innerHTML = `
    <span class="mr-2 file-name">${currentAttachFileList[i].name}</span>
    <span> (${formatBytes(currentAttachFileList[i].size)})</span>
    `
    let removeBtn = document.createElement("i")
    removeBtn.classList.add("bi","bi-x")
    removeBtn.addEventListener("click",(e) => {
      removeFile(i)
    })

    removeFileBtn.append(removeBtn)

    attachFileDiv.append(attachFileData)
    attachFileDiv.append(removeFileBtn)
    attachFilePresent.append(attachFileDiv)
  }
}

function toggleCcField() {
    let ccField = document.getElementById("ccField");
    ccField.classList.toggle("showElement")
  }
  
  function toggleBccField() {
    let bccField = document.getElementById("bccField");
    bccField.classList.toggle("showElement")
  }
  
  function toggleForm() {
    composeForm.classList.toggle("showElement")
  }


  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function removeFile(index)
  {
    let dataTransfer = new DataTransfer();
    let fileList = fileAttach.files
    for (let i = 0; i < fileList.length; i++) {
      if (i !== index) {
        dataTransfer.items.add(fileList[i]);
      }
    }
    fileAttach.files = dataTransfer.files;
    uploadAttachFilePresent()
  }

  $("document").ready(() => {

    addMailDetailLink()
  })

  function addMailDetailLink()
  {
    let displayMailList = document.querySelectorAll("#main .message-list li")

    displayMailList.forEach((mail) => {
      
      mail.addEventListener("click" , (e) => {
        
        if(e.target.classList.contains("star-toggle")){
          mid = e.target.parentElement.parentElement.parentElement.dataset.mid
          axios.post('/importants', {mid}, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then((response) => {
           if(response.data.code != 200)
           {
             mainViewAlertBox.innerHTML = 
           `<div class="alert alert-danger alert-dismissible fade show" role="alert">
               <button class="btn-close" type="button" aria-label="Close" data-bs-dismiss="alert"></button>
               <p style="margin-bottom: 0">${response.data.message}</p>    
             </div
           `
           }
           else
            {
              let star_classlist = e.target.classList
              if(response.data.action == 1)
              {
                
                star_classlist.remove("glyphicon-star-empty")
                star_classlist.add("glyphicon-star")

              }
              else
              {
                star_classlist.remove("glyphicon-star")
                star_classlist.add("glyphicon-star-empty")
                if(window.location.pathname == "/importants")
                {
                  let li_tag = e.target.parentElement.parentElement.parentElement
                  let mail_box = li_tag.parentElement
                  mail_box.removeChild(li_tag)
                }
              }
            } 
          })
          .catch((error) => {
            console.log(error)
            mainViewAlertBox.innerHTML = 
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                <button class="btn-close" type="button" aria-label="Close" data-bs-dismiss="alert"></button>
                <p style="margin-bottom: 0">${error.message}</p>    
              </div
            `
          });

        }
        else
        {
          window.location.href = `mail/detail/${mail.dataset.mid}`
        }
      })

    })
  }