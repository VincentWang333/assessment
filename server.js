const express = require('express');
const app = express();
const {
    caculate_pricing_for_a,
    caculate_pricing_for_b,
    caculate_pricing_for_c,
    caculate_pricing_for_d,
    get_quote_for_a,
    get_quote_for_b,
    get_quote_for_c,
    get_quote_for_d
} = require('./logic');
const DEFAULT_FLAT_FEE = 20;
const PORT = process.env.PORT;

if(PORT == null || PORT == ""){
    PORT = 3000;
}

app.use(express.json());


const server = app.listen(PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", PORT));
});

//endpoint to create pricing for each of the customers given the conditions above
app.post('/pricing', (req, res) => {
    const customer_name = req.query.customer_name;
    const current_inventory = req.query.current_inventory;
    const item = req.body.item;
    let flat_fee = req.query.flat_fee;
    let price;
    if (!flat_fee) {
        flat_fee = DEFAULT_FLAT_FEE;
    }
    if (customer_name) {
        if (customer_name === "A") {
            //customer A recieve 10% discount
            price = caculate_pricing_for_a(flat_fee);
        } else if (customer_name === "B") {
            //charge $1 per unit of volume
            if (item) {
                if (!item.length || !item.width || !item.height) {
                    return res.sendStatus(400);
                }
                price = caculate_pricing_for_b(item, flat_fee);
            } else {
                return res.sendStatus(400);
            }
        } else if (customer_name === "C") {
            if (item) {
                if (item.value) {
                    //be charged 5% of the value of the item being stored.
                    price = caculate_pricing_for_c(item, flat_fee);
                } else {
                    return res.sendStatus(400);
                }
            } else {
                return res.sendStatus(400);
            }
        } else if (customer_name === "D") {
            //5% discount for the first 100 items stored, 10% discount for the next 100, 
            //and then 15% on each additional item, and be charged at $2 per unit of volume for all items
            if (current_inventory) {
                if (current_inventory >= 200 && !item) {
                    return res.sendStatus(400);
                } else if (current_inventory >= 200 && item) {
                    if (!item.length || !item.width || !item.height) {
                        return res.sendStatus(400);
                    }
                }
                price = caculate_pricing_for_d(item, flat_fee, current_inventory);
            } else {
                //if current inventory is not provided, return bad request
                return res.sendStatus(400);
            }
        } else {
            price = parseInt(flat_fee);
        }
    } else {
        //if no customer name is provided
        return res.sendStatus(400);
    }
    return res.status(200).json({
        "price": price
    });
});



app.post('/quote', (req, res) => {
    const customer_name = req.query.customer_name;
    const items = req.body.items;
    let current_inventory = req.query.current_inventory;
    let flat_fee = req.query.flat_fee;
    let price;
    if (!flat_fee) {
        flat_fee = DEFAULT_FLAT_FEE;
    }
    if (items) {
        if (items.length === 0) {
            return res.sendStatus(400);
        }
    } else {
        return res.sendStatus(400);
    }

    if (customer_name) {
        if (customer_name === "A") {
            price = get_quote_for_a(items, flat_fee);
        } else if (customer_name === "B") {
            for (let i = 0; i < items.length; i++) {
                if (!items[i].length || !items[i].width || !items[i].height) {
                    return res.sendStatus(400);
                }
            }
            price = get_quote_for_b(items, flat_fee);
        } else if (customer_name === "C") {
            for (let i = 0; i < items.length; i++) {
                if (!items[i].value) {
                    return res.sendStatus(400);
                }
            }
            price = get_quote_for_c(items, flat_fee);
        } else if (customer_name === "D") {
            if (current_inventory) {
                current_inventory = parseInt(current_inventory);
                if (current_inventory + items.length > 200) {
                    for (let i = 0; i < items.length; i++) {
                        if (!items[i].length || !items[i].height || !items[i].width) {
                            return res.sendStatus(400);
                        }
                    }
                }
                price = get_quote_for_d(items, flat_fee, current_inventory);
            } else {
                //if no current inventory amount is provided, return bad request
                return res.sendStatus(400);
            }
        } else {
            price = items.length * flat_fee;
        }
    } else {
        return res.sendStatus(400);
    }
    return res.status(200).json({
        'price': price
    });
});

app.use(function (req, res, next) {
    res.status(404).send('Unable to find the requested resource!');
});

module.exports = server;