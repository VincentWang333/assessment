const caculate_pricing_for_a = function (flat_fee) {
    return flat_fee * 0.9;
}

const caculate_pricing_for_b = function (item, flat_fee) {
    let volume = item.length * item.width * item.height;
    price = flat_fee + (volume * 1);
    return price;
}

const caculate_pricing_for_c = function (item, flat_fee) {
    let price = flat_fee + (0.05 * item.value);
    return price;
}

const caculate_pricing_for_d = function (item, flat_fee, current_inventory) {
    let price = 0;
    if (current_inventory <= 100) {
        price = flat_fee * 0.95;
    } else if (current_inventory > 100 && current_inventory < 200) {
        price = flat_fee * 0.9;
    } else {
        let volume = item.length * item.width * item.height;
        price = (flat_fee * 0.85) + (volume * 2);
    }
    return price
}

const get_quote_for_a = function (items, flat_fee) {
    let price = items.length * flat_fee * 0.9;
    return price;
}

const get_quote_for_b = function (items, flat_fee) {
    let volume_sum = 0;
    for (let i = 0; i < items.length; i++) {
        let volume = items[i].length * items[i].width * items[i].height;
        volume_sum += volume;
    }
    let price = (flat_fee * items.length) + (volume_sum * 1);
    return price;
}

const get_quote_for_c = function (items, flat_fee) {
    let charge_sum = 0;
    for (let i = 0; i < items.length; i++) {
        charge_sum += items[i].value * 0.05;
    }
    let price = (flat_fee * items.length) + charge_sum;
    return price;
}

const get_quote_for_d = function (items, flat_fee, current_inventory) {
    let price = 0;
    if (current_inventory + items.length <= 100) {
        price = items.length * flat_fee * 0.95;
    } else if (current_inventory + items.length > 100 && current_inventory + items.length <= 200) {
        if (current_inventory < 100) {
            //part of new items is 5% discount and part of items are 10%
            const under_hundred_items = 100 - current_inventory;
            const over_hundred_items = current_inventory + items.length - 100
            price = (under_hundred_items * flat_fee * 0.95) + (over_hundred_items * flat_fee * 0.9);
        } else {
            console.log("yes");
            // all new items are add on 100 existed items
            price = items.length * flat_fee * 0.9;
        }
    } else {
        if (current_inventory < 100) {
            //part of new items is 5% discount and 100 items are 10% and the rest are 15%off with $2 per unit of volume
            const under_hundred_items = 100 - current_inventory;
            for (let i = 0; i < items.length; i++) {
                if (i < under_hundred_items) {
                    price += flat_fee * 0.95;
                } else if (i >= under_hundred_items && i < under_hundred_items + 100) {
                    price += flat_fee * 0.9;
                } else {
                    let volume = items[i].length * items[i].height * items[i].width;
                    price += (flat_fee * 0.85) + (2 * volume);
                }
            }
        } else if (current_inventory >= 100 && current_inventory < 200) {
            //part of items are in 10% off  and part are 15% off with $2 per unit of volume
            const over_hundred_under_two_hundred_items = 200 - current_inventory;
            for (let i = 0; i < items.length; i++) {
                if (i < over_hundred_under_two_hundred_items) { //when new item is in 10% off
                    price += flat_fee * 0.9;
                } else { //when new item is 15% off with $2 per unit of volume
                    let volume = items[i].length * items[i].height * items[i].width;
                    price += (flat_fee * 0.85) + (2 * volume);
                }
            }
        } else {
            //when all items are 15% off with 2$ per unit of volume
            for (let i = 0; i < items.length; i++) {
                let volume = items[i].length * items[i].height * items[i].width;
                let unit_price = (flat_fee * 0.85) + (2 * volume)
                price += unit_price;
            }
        }
    }
    return price;

}


module.exports = {
    caculate_pricing_for_a,
    caculate_pricing_for_b,
    caculate_pricing_for_c,
    caculate_pricing_for_d,
    get_quote_for_a,
    get_quote_for_b,
    get_quote_for_c,
    get_quote_for_d

}