let boardUrl;
let actualUrl;

$('document').ready(() => {

    //createboard function
    $('#createBoard').click((e) => {
        e.preventDefault();
        let boardName = $('#boardName').val().trim();
        let email = $('#ownerEmail').val().trim();
        let emailRegex = /^([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$)/;
        if(boardName &&  emailRegex.test(email) ) {
            $('#boardName').val("");
            $('#ownerEmail').val("");
            let data = {
                name: boardName
            }
            $.post("/api/boards/new", data, function (data) {
                if(data.errors) return console.log(data);
                $('#modalInvite').html(`<a href="${location.href}boards/${data.id}">
                Click Here For Your Board URL</a>`);
                boardUrl = $('#modalInvite').html();
                actualUrl = $("#modalInvite a").html();
                $('#modalInvite').attr("data-boardName", data.name);
                //code for emailing an invite
                let mailData = {
                    to: email,
                    subject: "Welcome to Corkboard",
                    bodyText: 
                    `Your Board's name is: ${data.name}
                    Your access url is: ${location.href}boards/${data.id}`,
                    htmlText: 
                    `<h1>Welcome to corkboard!</h1>
                    <h3>Your board name is: ${data.name}</h3>
                    Your Board URL is: <a href="${location.href}boards/${data.id}">
                    ${location.href}boards/${data.id}</a>
                    <p>Please bookmark your board page and save this email for reference</p>`,
                };
                //mail(req.body.to, req.body.subject, req.body.bodyText, req.body.htmlText);
                $.post("/api/mail", mailData, function(data2) {
                    $('#inviteModal').modal();
                });
            });
        } else {
            $('#errModalText').html('Must provide Board Name and valid Email address');
            $('#errorModal').modal();
        }
    });
    $("#skipBtn").click((e)=>{
        e.preventDefault();
        location.href = actualUrl;
    });

    $('#sendInvites').click((e)=> {
        e.preventDefault();
        let modalUrlMsg = boardUrl;
        let boardName = $('#modalInvite').attr("data-boardName");
        let aTag = actualUrl;
        let emailList = $('#inviteEmails').val().trim();
        let emailMsg = $('#inviteEmailMsg').val().trim();
        if(emailList) {
            $('#inviteEmails').val("");
            $('#inviteEmailMsg').val("");
            let emailArr = emailList.split(",");
            let emailRegex = /^([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$)/;
            for(let i = 0; i < emailArr.length; i++) {
                if(!emailRegex.test(emailArr[i])) {
                    return $('#modalInvite').html("<h1>Please Provide Valid Emails</h1>");
                }
            }

            let mailData = {
                to: emailList,
                subject: `You're invited to a new Corkboard!`,
                bodyText: 
                `Welcome to Corkboard!
                Your Board's name is: ${boardName}
                Your access url is: ${aTag}
                Message: ${emailMsg}
                Please bookmark your board page and save this email for reference`,
                htmlText: 
                `<h1>Welcome to corkboard!</h1>
                <h3>Your Board's name is: ${boardName}</h3>
                Your Board URL is: <a href="${aTag}">${aTag}</a><br>
                Message from Board Creator: ${emailMsg}<br>
                Please bookmark your board page and save this email for reference`,
            };
            //mail(req.body.to, req.body.subject, req.body.bodyText, req.body.htmlText);
            $.post("/api/mail", mailData, function(data2) {
                $('#modalInvite').html(modalUrlMsg + "<p>Your invite message has been sent!</p>"
                + "<p>Taking you to your board page in 5 seconds...</p>");
                $('#inviteEmails').hide();
                $('#inviteEmailMsg').hide();
                setTimeout(()=> location.href = aTag, 5000);
            });

        } else {
            $('#modalInvite').html("<h1>Please Provide Valid Emails</h1>");
        }
        
    })

});