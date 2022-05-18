/*
 * jQuery v1.9.1 included
 */

$(document).ready(function() {


    $(".share a").click(function(e) {
        e.preventDefault();
        window.open(this.href, "", "height = 500, width = 500");
    });

    var $commentContainerTextarea = $(".comment-container textarea"),
        $commentContainerFormControls = $(".comment-form-controls, .comment-ccs");

    $commentContainerTextarea.one("focus", function() {
        $commentContainerFormControls.show();
    });

    if ($commentContainerTextarea.val() !== "") {
        $commentContainerFormControls.show();
    }

    var $showRequestCommentContainerTrigger = $(".request-container .comment-container .comment-show-container"),
        $requestCommentFields = $(".request-container .comment-container .comment-fields"),
        $requestCommentSubmit = $(".request-container .comment-container .request-submit-comment");

    $showRequestCommentContainerTrigger.on("click", function() {
        $showRequestCommentContainerTrigger.hide();
        $requestCommentFields.show();
        $requestCommentSubmit.show();
        $commentContainerTextarea.focus();
    });

    var $requestMarkAsSolvedButton = $(".request-container .mark-as-solved:not([data-disabled])"),
        $requestMarkAsSolvedCheckbox = $(".request-container .comment-container input[type=checkbox]"),
        $requestCommentSubmitButton = $(".request-container .comment-container input[type=submit]");

    $requestMarkAsSolvedButton.on("click", function() {
        $requestMarkAsSolvedCheckbox.attr("checked", true);
        $requestCommentSubmitButton.prop("disabled", true);
        $(this).attr("data-disabled", true).closest("form").submit();
    });

    var $requestCommentTextarea = $(".request-container .comment-container textarea");

    $requestCommentTextarea.on("keyup", function() {
        if ($requestCommentTextarea.val() !== "") {
            $requestMarkAsSolvedButton.text($requestMarkAsSolvedButton.data("solve-and-submit-translation"));
            $requestCommentSubmitButton.prop("disabled", false);
        } else {
            $requestMarkAsSolvedButton.text($requestMarkAsSolvedButton.data("solve-translation"));
            $requestCommentSubmitButton.prop("disabled", true);
        }
    });

    if ($requestCommentTextarea.val() === "") {
        $requestCommentSubmitButton.prop("disabled", true);
    }

    $("#request-status-select, #request-organization-select")
        .on("change", function() {
            search();
        });

    $("#quick-search").on("keypress", function(e) {
        if (e.which === 13) {
            search();
        }
    });

    function search() {
        window.location.search = $.param({
            query: $("#quick-search").val(),
            status: $("#request-status-select").val(),
            organization_id: $("#request-organization-select").val()
        });
    }

    $(".header .icon-menu").on("click", function(e) {
        e.stopPropagation();
        var menu = document.getElementById("user-nav");
        var isExpanded = menu.getAttribute("aria-expanded") === "true";
        menu.setAttribute("aria-expanded", !isExpanded);
    });

    if ($("#user-nav").children().length === 0) {
        $(".header .icon-menu").hide();
    }

    $("#request-organization select").on("change", function() {
        this.form.submit();
    });

    $(".collapsible-nav, .collapsible-sidebar").on("click", function(e) {
        e.stopPropagation();
        var isExpanded = this.getAttribute("aria-expanded") === "true";
        this.setAttribute("aria-expanded", !isExpanded);
    });

    $('.article-body').find('table').wrap('<div class="table-responsive"></div>');

    function getData(count, callback, param) {
        var count = count ? count : 100;
        return $.ajax({
            url: '/api/v2/help_center/' + $('html').attr('lang').toLowerCase() + '/categories.json?per_page=' +
                count + param,
            type: 'GET',
            dataType: 'json',
            success: callback
        });
    };

    function createHtml(cb) {
        var navigationHtml = '';
        $.when(getData()).then(function(data) {
            $.each(data.categories, function(idx, itm) {
                navigationHtml += categorySidebarTemplate
                    .replace('CAT-ID', itm.id)
                    .replace('CAT-URL', itm.html_url)
                    .replace('CAT-TITLE', itm.name)
                    .replace('CAT-NAME', itm.name);
            });

            cb(navigationHtml);
        });
    }

    function domQuery(el) {

        var localCachedMenu = localStorage.getItem('navigation-menu'),
            localCachedUserRole = localStorage.getItem('userrole');
        localCachedLocale = localStorage.getItem('locale');
        locale = $('html').attr('lang').toLowerCase();

        if ((localCachedMenu) &&
            (HelpCenter.user.role == localCachedUserRole) &&
            (locale == localCachedLocale)) {
            $(el).html(localCachedMenu);
        };

        createHtml(function(html) {
            if ((!localCachedMenu) ||
                (HelpCenter.user.role != localCachedUserRole) ||
                (locale != localCachedLocale)) {
                $(el).html(html);
            };

            localStorage.setItem('userrole', HelpCenter.user.role);
            localStorage.setItem('navigation-menu', html);
            localStorage.setItem('locale', locale);
        });
    }

    const multibrandFilterLists = document.querySelectorAll(".multibrand-filter-list");
    Array.prototype.forEach.call(multibrandFilterLists, function(filter) {
        if (filter.children.length > 6) {
            var trigger = filter.querySelector(".see-all-filters");
            trigger.setAttribute("aria-hidden", false);

            trigger.addEventListener("click", function(e) {
                e.stopPropagation();
                trigger.parentNode.removeChild(trigger);
                filter.classList.remove("multibrand-filter-list--collapsed")
            })
        }
    });

    const notificationElm = document.querySelector(".notification-error");
    if (
        notificationElm &&
        notificationElm.previousElementSibling &&
        typeof notificationElm.previousElementSibling.focus === "function"
    ) {
        notificationElm.previousElementSibling.focus();
    }
});

var $ = jQuery.noConflict();

$(document).ready(function() {
    if (
        _templateName == "categories" ||
        _templateName == "sections" ||
        _templateName == "articles"
    ) {
        initMultiLevelMenu({
            htmlClass: "diziana-category-sidebar-menu",
            storageType: "session"
        });

        setTimeout(function() {
            $("li.category-" + catID).addClass("active");
            }, 1000);
    }

    $("#toc").toc({ content: ".article-body" });
    var tocLength = $("#toc").children().length;
    if (tocLength) {
        $('#article-toc').show();
    }

    $('#toc a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

            if (target.length) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top - 60
                }, 1000, function() {
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) {
                        return false;
                    } else {
                        $target.attr('tabindex', '-1');
                        $target.focus();
                    };
                });
            }
        }
    });
    const notificationElm = document.querySelector(".notification-error");
    if (
        notificationElm &&
        notificationElm.previousElementSibling &&
        typeof notificationElm.previousElementSibling.focus === "function"
    ) {
        notificationElm.previousElementSibling.focus();
    }

    if ($(".search-results-sidebar").children().length < 1) {
        $(".search-results-sidebar").addClass("hide");
    }

    if ($(".section-articles > ul").children().length < 1) {
        $(".article-sidebar.collapsible-sidebar").addClass("hide");
    }
});