const imgDiv = document.querySelector('.profile-pic-div');
const img = document.querySelector('#photo');
const file = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');
const copyButton = document.querySelector("#copyPublicID")
const PUID = document.querySelector("#userPUID")

imgDiv.addEventListener('mouseenter', function(){
    uploadBtn.style.display = "block";
});


imgDiv.addEventListener('mouseleave', function(){
    uploadBtn.style.display = "none";
});

let currentAvatarSrc;

file.addEventListener('change', function(){

    const choosedFile = this.files[0];
    
    if (choosedFile) {
        

        const reader = new FileReader(); 

        reader.addEventListener('load', function(){
            currentAvatarSrc = img.src
            img.setAttribute('src', reader.result);
        });

        reader.readAsDataURL(choosedFile);


        let saveButton = document.createElement("button")
        let cancelButton = document.createElement("button")
        let uploadAvatarForm = document.querySelector("#upload-avatar")

        uploadAvatarForm.addEventListener("submit", (e) => {
            e.preventDefault();
        })

        saveButton.type ="button"
        cancelButton.type = "button"

        saveButton.classList.add("btn", "btn-success","cofirm-btn","m-b-10")
        saveButton.innerText = "Save"
        saveButton.addEventListener("click",(e) => {

            document.querySelector("#systemUserProfile .user-profile .upload-avatar-button").innerHTML = `
                <div class="text-center upload-spinner">
                    <div class="spinner-border" role="status"></div>
                </div>
            `
            let data = new FormData(uploadAvatarForm)

            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/user/upload/avatar",
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                timeout: 600000,
                success: function (data) {

                    console.log(data)
                    document.querySelector("#systemUserProfile .user-profile .upload-avatar-button").innerHTML = `
                        <div class="alert alert-success alert-dismissible fade show" role="alert">                               
                            <p>${data.message}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `

                },
                error: function (e) {
                    console.log(e)
                    document.querySelector("#systemUserProfile .user-profile .upload-avatar-button").innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">                               
                            <p>${e.responseJSON.message}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `
                    img.setAttribute('src', currentAvatarSrc);
                }
            });

        })

        cancelButton.classList.add("btn", "btn-danger","cofirm-btn")
        cancelButton.innerText = "Cancel"
        cancelButton.addEventListener("click",(e) => {

            img.setAttribute('src', currentAvatarSrc);
            document.querySelector("#systemUserProfile .user-profile .upload-avatar-button").innerHTML = "";
        })


        document.querySelector("#systemUserProfile .user-profile .upload-avatar-button").append(saveButton,cancelButton)
        
    }
});

copyButton.addEventListener("click",(e) => {
    navigator.clipboard.writeText(PUID.dataset.puid);
})


