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
 * @param {*} type `checkbox`, `number`
 * @param {*} listeners array of listeners
 * @returns 
 */
function createInput(container_id, labelText, type, listeners){
    let container = document.createElement('div');
    container.setAttribute('id', container_id);
    let label = document.createElement('label');
    label.innerText = labelText;
    let checkbox = document.createElement('input');
    checkbox.setAttribute('type', type);
    for (let listener of listeners){
        let {key, handler} = listener;
        checkbox.addEventListener(key, handler);
    }
    container.appendChild(label);
    container.appendChild(checkbox);
    return container;
}

//TODO: Add these 2 methods somewhere else
function changeCheckbox_changeHandler(bot_id, key, evt){
    if (key === "GET_COINS"){
        document.getElementById(`container-coins-policy-turns-${bot_id}`).classList.toggle("coin-hide")
    }
    grid.update_bot_policy(bot_id, key, evt.target.checked);
}

/**
 * 
 * @param {*} bot_id 
 * @param {*} container_id 
 * @param {*} options {key: {value: "value", text:"text value"}}
 * @returns multiple checkbox. Not general but specifically for the bots
 */
function createCheckboxGroup(bot_id, container_id, options){
    let container = document.createElement('div');
    container.classList.add('checkbox-group');
    container.setAttribute('id', container_id);
    for (let [key, {value, text}] of Object.entries(options)){
        let input = document.createElement('input');
        let inputId = `${container_id}-value-${value}`
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', inputId);
        let label = document.createElement('label');
        label.setAttribute('for', inputId);
        label.innerText = text;
        input.addEventListener('change', (evt)=>{
            changeCheckbox_changeHandler(bot_id, key, evt);
        })
        let subContainer = document.createElement('div');
        subContainer.appendChild(label);
        subContainer.appendChild(input);
        if (key === "GET_COINS"){
            // Add a count input for how long to look ahead
            
            let countId = `coins-policy-turns-${bot_id}`;
            let select = createSelect(countId, "How far ahead?", [
                {value: 1, text: 1},
                {value: 2, text: 2},
                {value: 3, text: 3},
                {value: 4, text: 4},
            ], [])
            select.classList.add("coin-hide");
            subContainer.appendChild(select);
        }
        container.appendChild(subContainer);
    }
    return container;
}
