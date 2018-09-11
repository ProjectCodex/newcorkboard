$('document').ready(() => {
    // console.log('ready')
    let urlField;
    //filter buttons
    $('#filter, .filterBtn').click(() => {
        $('.filterCard').toggle('blind');
        $('#close').show();
        $('#filter').hide();
        $('#dropAnnounce').hide('blind');
    });


    //show/hide announcements
    $('#announce').click(() => {
        $('#dropAnnounce').show('blind');
        $('.onPlusClose').show();
        $('#closeAnn').toggle();
        $('#announce, #close, .filterCard').hide();
        // $('#filter').show();

    });

    $('#closeAnn').click(() => {
        $('#dropAnnounce').hide('blind');
        $('#announce').show();
        $('#closeAnn').hide();

    });

    //Small menu button
    $('.smallMenu').click(() => {
        $('#dropAnnounce, .filterCard, #closeAnn').hide();
        $('#announce').show();
    });

    //Small add button
    $('.smallAdd').click(() => {
        $('#closeAnn, #close, #dropAnnounce, .onPlusClose').hide();
        $('#announce').show();

    });
    //X for close
    $('#close').click(() => {
        $('.filterCard').hide('blind');
        $('#filter').show();
        $('#close').hide();
    });

    //close filter when clicking topMenu buttons
    $('#newLink, #newLink2').click(() => {
        $('.filterCard').hide('blind');
        $('#filter').show();
        $('#close').hide();

    });

    $('.newLink2').click(() => {
        $('#filter').hide();
    });
    //delete link
    $('.cardDelete').click((event) => {
        let linkId = $(event.target).attr("data-linkId");
        const boardId = $('#boardName').attr("data-boardId");
        $.ajax({
            method: "DELETE",
            url: `/api/boards/${boardId}/links/${linkId}`,
            success: function (results) {
                location.reload();
            }
        });
    });

    //topic submit function
    $('.link').click((e) => {
        e.preventDefault();
        const id = $('#boardName').attr("data-boardId")
        var field = $('#title').val().trim();
        // console.log(field);
        let data = {
            name: field
        }
        $.post('/api/boards/' + id + '/tags/new', data, function (data) {
            console.log(data);
            location.reload();
        });
    })

    //post submit function
    $('.postButton').click((e) => {
        const id = $('#boardName').attr("data-boardId")
        e.preventDefault();
        var newTitle = $('#postTitle').val().trim();
        var newUrl = $('#postUrl').val().trim();
        var newDescription = $('#postDescription').val().trim();
        var newImageUrl = $('#postImgUrl').val().trim();

        let data = {
            title: newTitle,
            description: newDescription,
            url: newUrl,
            image_url: newImageUrl
        }
        let tags = [];
        //loop through checkboxes and push checked box values to array
        $('.postTags').find('input').each((index, element) => {
            if ($(element).is(":checked")) {
                tags.push($(element).val());
            }
        });

        data.tags = tags;

        $.post('/api/boards/' + id + '/links/new', data, function (data) {
            console.log(data);
            location.reload();
        });
    });

    //submit edit card data to DB
    $('.editButton').click((e) => {
        const boardId = $('#boardName').attr("data-boardId");
        let linkId = $(e.target).attr('data-linkid');
        let data = {
            title: $('#editTitle').val().trim(),
            url: $('#editUrl').val().trim(),
            description: $('#editDescription').val().trim(),
            image_url: $('#editImgUrl').val().trim()
        }

        let tags = [];
        //loop through checkboxes and push checked box values to array
        $('.editTags').find('input').each((index, element) => {
            if ($(element).is(":checked")) {
                tags.push($(element).val());
            }
        });
        if (tags.length > 0) {
            data.tags = tags;
        } else {
            data.tags = null;
        }

        //console.log(linkId, data);
        $.ajax({
            method: "PUT",
            url: `/api/boards/${boardId}/links/${linkId}`,
            data: data,
            success: (results) => {
                location.reload();
            }
        })
    });

    //populates edit modal with data
    $('.cardEdit').click((e) => {
        //grab card data
        let linkId = $(e.target).attr("data-linkid").trim();
        let title = $('#cardTitleLinkNum' + linkId).text().trim();
        let url = $('#cardUrlLinkNum' + linkId).text().trim();
        let desc = $('#cardDescLinkNum' + linkId).text().trim();
        let imgUrl = $('#cardImgLinkNum' + linkId).attr("src");
        if (imgUrl) {
            imgUrl = imgUrl.trim();
        }

        let currentTags = [];
        //grab current tags off of card
        $('.tags' + linkId).find('a').each((index, element) => {
            currentTags.push($(element).attr("data-tagid"));
        });

        //loop through checkboxes and check those that are currently tags of card
        $('.editTags').find('input').each((index, element) => {
            if (currentTags.indexOf($(element).val()) > -1) {
                $(element).prop("checked", true);
            } else {
                $(element).prop("checked", false);
            }
        });

        //populate edit modal fields with current card data
        $('#editTitle').val(title);
        $('#editUrl').val(url);
        $('#editDescription').val(desc);
        $('#editImgUrl').val(imgUrl);
        $('.editButton').attr("data-linkid", linkId);
    });

    //add a announcement
    $('.announcementButton').click((e) => {
        const id = $('#boardName').attr("data-boardId")
        e.preventDefault();
        var newMsg = $('#postMsg').val().trim();
        var newAuthor = $('#postAuthor').val().trim();
        console.log(newMsg);
        let data = {
            msg: newMsg,
            author: newAuthor
        }
        $.post('/api/boards/' + id + '/msgs/new', data, function (data) {
            console.log(data);
            location.reload();
        });
    });

    //edit message
    $('.editSubmit').click((e) => {
        const id = $('#boardName').attr("data-boardId")
        const msgId = $('.cardDescription').attr('data-descId')
        e.preventDefault();
        var updateMsg = $('#putMsg').val().trim();
        //var updateAuthor = $('#putAuthor').val().trim();

        let data = {
            msg: updateMsg,
            //author: updateAuthor
        }
        $.put('/api/boards/' + id + '/msgs/' + id.description, data, function (data) {
            console.log(data);
            location.reload();
        });
    });

    //this fx scrapes meta data when url info is entered into the add bookmark url field
    $('#postUrl').change(function (event) {
        let urlInput = event.target.value;
        if (!urlInput.startsWith('http')) {
            urlInput = 'http://' + urlInput;
            //$('#postUrl').val(urlInput);
        }
        if (urlInput !== urlField) {
            urlField = urlInput;
            // console.log(urlField);
            $.post('/api/scrape', {
                url: urlField
            }, function (data) {
                // console.log(data);
                $('#postTitle').val(data.title);
                $('#postDescription').val(data.description);
                $('#postUrl').val(data.url);
                $('#postImgUrl').val(data.image);
            });
        }
    });

    //this function searches by multiple tags
    $('#tagSearch').click(() => {
        const boardId = $('#boardName').attr("data-boardId")
        let checkedTags = [];
        $('.filterButtons').find('input').each((index, element) => {
            if ($(element).is(':checked')) {
                let tagId = $(element).val();
                checkedTags.push(tagId);
            }
        });
        let data = {
            tags: checkedTags
        };
        $.post(`/boards/${boardId}/tags`, data, function (results) {
            //console.log(results);
            if ($.isEmptyObject(results)) {
                $("#editTopicModalLabel").text("Please Select Tags to include in Search");
                $("#editTagSubmit").hide();
                $("#editTagModalName").hide();
                $('#editTopicModal').modal();
            } else {
                $('body').html(results);
            }
        });
    });

    $('#tagDelete').click(() => {
        const boardId = $('#boardName').attr("data-boardId")
        let checkedTags = [];
        let tagId;
        $('.filterButtons').find('input').each((index, element) => {
            if ($(element).is(':checked')) {
                tagId = $(element).val();
                checkedTags.push(tagId);
            }
        });
        if (checkedTags.length === 1) {
            $.ajax({
                method: "DELETE",
                url: `/api/boards/${boardId}/tags/${tagId}`,
                success: function (results) {
                    location.reload();
                }
            });
        } else {
            $("#editTopicModalLabel").text("Please Select One Tag to Delete");
            $("#editTagSubmit").hide();
            $("#editTagModalName").hide();
            $('#editTopicModal').modal();
        }
    });

    //populate and validate edit tag modal
    $('#tagEdit').click(() => {
        let checkedTags = 0;
        let tagName;
        let tagId;
        $('.filterButtons').find('input').each((index, element) => {
            if ($(element).is(':checked')) {
                tagName = $(element).closest('label').text();
                tagId = $(element).val();
                checkedTags++;
            }
        });
        if (checkedTags !== 1) {
            $("#editTopicModalLabel").text("Please Select One Tag to Edit");
            $("#editTagSubmit").hide();
            $("#editTagModalName").hide();
            $('#editTopicModal').modal();
        } else {
            $("#editTopicModalLabel").text("Edit Tag Name:");
            $("#editTagSubmit").attr("data-tagId", tagId).show();
            $("#editTagModalName").val(tagName.trim()).show();
            $('#editTopicModal').modal();
        }
    });

    //send tag edit to server
    $("#editTagSubmit").click((e) => {
        const boardId = $('#boardName').attr("data-boardId");
        let tagId = $(e.target).attr("data-tagId");
        let newTagName = $("#editTagModalName").val();
        let data = {
            name: newTagName
        };
        $.ajax({
            method: "PUT",
            url: `/api/boards/${boardId}/tags/${tagId}`,
            data: data,
            success: (results) => {
                location.reload();
            }
        })
    });
}) //end document.ready