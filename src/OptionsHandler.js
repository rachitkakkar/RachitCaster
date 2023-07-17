export class OptionsHandler {
    constructor() {
        this.checkBoxes = [];
        this.optionState = new Map();
    }

    handleOptions() {
        for (const checkBox of this.checkBoxes) {
            this.optionState.set(checkBox.id, checkBox.checked);
        }
    }

    addOption(name) {
        let checkBox = document.getElementById(name);
        this.checkBoxes.push(checkBox);
        this.optionState.set(name, checkBox.checked)
    }

    bindOptions() {
        for (const checkBox of this.checkBoxes) {
            checkBox.addEventListener("click", this.handleOptions.bind(this), false);
        }
    }

    getOption(name) {
        return this.optionState.get(name);
    }
}