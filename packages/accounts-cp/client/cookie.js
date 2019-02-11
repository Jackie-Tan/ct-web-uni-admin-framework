function setCookie(cname, cvalue, seconds, domain = '') {
    var d = new Date();
    d.setTime(d.getTime() + (seconds * 1000));
    var expires = `expires=${d.toUTCString()}`;
    let cookie = `${cname}=${cvalue};${expires}${domain ? `;domain=${domain}` : ''};path=/`
    document.cookie = cookie;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function removeCookie(cname, domain = '') {
    document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC${domain ? `;domain=${domain}` : ''};path=/;`;
}

export { setCookie, getCookie, removeCookie }