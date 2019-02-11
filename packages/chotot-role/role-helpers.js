var ROLE_LIST = {};
var USER_ROLE = [];
var ROLE_ACTIONS = {};
var ROLE_MANAGES = {};
function AddToRoleList(item) {
    let resp = ROLE_LIST;
    let roles = item.roles;
    let prefixArr = item.prefix && item.prefix.split('/') || ""
    let prefix = prefixArr[1]||  prefixArr[0]
    for (let role of roles) {
    let bigRole = Math.trunc(role/100)*100;
    if (!resp[bigRole]) {
        resp[bigRole] = {}
    }
    if (!resp[bigRole][role]) {
        resp[bigRole][role] = []
    }
    if (!resp[bigRole][bigRole]) {
        resp[bigRole][bigRole] = [`${prefix} admin`]
    }
    resp[bigRole][role].push(`${prefix} ${item.display}`)
    }
    for (let bigRole in resp) {
        ROLE_MANAGES[bigRole] = Object.keys(resp[bigRole]);
    }
}
function AddUserRole(item) {
    let resp = USER_ROLE;
    let roles = item.roles;
    for (let role of roles) {
        let bigRole = Math.trunc(role / 100) * 100;
        if (resp.indexOf(bigRole) != -1)
            continue;
        resp.push(bigRole)
    }
};
function AddRoleActions(key, item) {
    let resp = ROLE_ACTIONS;
    let roles = item.actions_config || {};
    if (!resp[key])
        resp[key] = []
    let prefixArr = item.prefix && item.prefix.split('/') || ""
    let prefix = prefixArr[1] || prefixArr[0];
    let respAction = {}
    for (let action in roles) {
        let role = roles[action].role;
        if (!respAction[role]) respAction[role] = []
        respAction[role].push(`${action}`)
    }
    for (let role in respAction) {
        resp[key].push({
            value: `${key}.${role}`,
            text: `${prefix}/${item.display}:[${respAction[role].join(',')}]`
        })
    }
};

module.exports = {
    AddToRoleList,
    AddUserRole,
    AddRoleActions,
    ROLE_LIST,
    USER_ROLE,
    ROLE_ACTIONS,
    ROLE_MANAGES
}