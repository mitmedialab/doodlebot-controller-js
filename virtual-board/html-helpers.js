/**
 * 
 * @param {*} id if of button
 * @param {*} text text of button
 * @param {*} listeners array of listeners
 * @returns 
 */
function createButton(id, text, listeners=[]){
    let button = document.createElement('button');
    button.innerText = text;
    button.setAttribute('id', id);
    for (let listener of listeners){
        let {key, handler} = listener;
        button.addEventListener(key, handler);
    }
    return button;
}

/**
 * @param id id of select, will be wrapped in a div with id `container-${id}`
 * @param labelText label of the select
 * @param options is an array of {value:, text:} objects
 * @param listeners array of listeners
 */
function createSelect(id, labelText, options, listeners=[]){
    let div = document.createElement('div');
    div.setAttribute('id', `container-${id}`)
    let label = document.createElement('label');
    label.innerText = labelText;
    let select = document.createElement('select');
    select.setAttribute('id', id);
    for (let option of options){
        let {value, text} = option;
        let newOption = document.createElement('option');
        newOption.setAttribute('value', value);
        newOption.innerText = text;
        select.appendChild(newOption);
    }
    for (let listener of listeners){
        let {key, handler} = listener;
        select.addEventListener(key, handler);
    }
    div.appendChild(label);
    div.appendChild(select);
    return div;
}
/**
 * 
 * @param {*} container_id id of container
 * @param {*} labelText label of checkbox
 * @param {*} listeners array of listeners
 * @returns 
 */
function createCheckbox(container_id, labelText, listeners){
    let container = document.createElement('div');
    container.setAttribute('id', container_id);
    let label = document.createElement('label');
    label.innerText = labelText;
    let checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    for (let listener of listeners){
        let {key, handler} = listener;
        checkbox.addEventListener(key, handler);
    }
    container.appendChild(label);
    container.appendChild(checkbox);
    return container;
}

