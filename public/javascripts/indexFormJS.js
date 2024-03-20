const signinbtn = document.querySelector('.signinbtn');
const signupbtn = document.querySelector('.signupbtn');
const formbox = document.querySelector('.form-box');
const body = document.querySelector('body');

signinbtn.onclick = () => { 
    formbox.classList.remove('active');
    body.classList.remove('active');
}

signupbtn.onclick = () => {
    formbox.classList.add('active');
    body.classList.add('active');
}

const alertBox = document.querySelector(".alert-box .alert-box-holder")
const register_Form = document.querySelector("#register-form");

register_Form.addEventListener("submit",(event)=>{
    event.preventDefault();

    $.ajax({
        type: "POST",
        url: "/auth/register",
        data: $('#register-form').serialize(),
        dataType: "json",

    }).done((response,textStatus,jqXHR) => {
        
        showFLashMessage(response.code, response.message)
        
    });
})

function showFLashMessage(type, message)
{
    let div = document.createElement('div');
    let title = document.createElement('h4')
    let content = document.createElement('p')
    let progressBar = document.createElement('div')
    let closeButton = document.createElement("button")

    title.classList.add('alert-heading')
    title.innerText = message.title

    content.innerText = message.message

    div.classList.add('alert', 'alert-dismissible', 'fade', 'show')
    div.role = "alert";
    div.appendChild(title)
    div.innerHTML += '<hr>'
    div.appendChild(content)

    closeButton.type = "button";
    closeButton.classList.add('btn-close')
    closeButton.setAttribute("data-bs-dismiss","alert")
    closeButton.setAttribute("aria-label", "Close")

    div.appendChild(closeButton)

    

    if(type === 200)
    {
        div.classList.add("alert-success")
        signinbtn.click();
        register_Form.querySelectorAll("input").forEach(i => {
            if(i.type != "submit")
            {
                i.value ="";
            }
        })
    }
    else
    {
        div.classList.add("alert-danger")
        progressBar.classList.add('progress')
        progressBar.role = "progressbar"
        progressBar.setAttribute("aria-valuenow", "100")
        progressBar.setAttribute("aria-valuemin", "0")
        progressBar.setAttribute("aria-valuemax", "100")
        progressBar.setAttribute('aria-label',"Danger")
        progressBar.style.height = '1px'
        progressBar.innerHTML = '<div class="progress-bar bg-danger" style="width: 100%"></div>'
        div.appendChild(progressBar)
    }
    
    alertBox.innerHTML = "";
    alertBox.appendChild(div);
    

    let duration = 5000;
    let timeLeft = duration

    let countdown = setInterval(function() {
        
        timeLeft-= 100;

        let percent = Math.floor((timeLeft / duration) * 100);
        progressBar.querySelector(".progress-bar.bg-danger").style.width = `${percent}%`;
        // if the countdown is complete, clear the interval and perform an action
        if(timeLeft <= 200)
        {
            progressBar.querySelector(".progress-bar.bg-danger").style.width = "0%";
        }
        if (timeLeft < 0) {
          
          clearInterval(countdown);  
          if(alertBox.contains(div)) alertBox.removeChild(div);
          
        }
      }, 100);

}