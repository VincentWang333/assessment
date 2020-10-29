const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const expect = chai.expect
chai.use(chaiHttp);
const FLAT_FEE = 20


const item_missing_info = {
    "item": {
        "name": "fridge",
        "length": "3",
        "height": "6",
        "weight": "200",
        "value": "1000"
    }
}
const item = {
    "item": {
        "name": "fridge",
        "length": "3",
        "width": "4",
        "height": "6",
        "weight": "200",
        "value": "1000"
    }
}

const item_missing_value = {
    "item": {
        "name": "fridge",
        "length": "3",
        "width": "4",
        "height": "6",
        "weight": "200",
    }
}

const items = {
    "items": [{
            "name": "fridge",
            "length": "3",
            "width": "4",
            "height": "6",
            "weight": "300",
            "value": "1000"
        },
        {
            "name": "sofa",
            "length": "6",
            "width": "4",
            "height": "3",
            "weight": "100",
            "value": "500"
        }
    ]
};

const items_empty = {
    "items": []
};

const items_missing_info = {
    "items": [{
            "name": "fridge",
            "length": "3",
            "width": "4",
            "weight": "300",
            "value": "1000"
        },
        {
            "name": "sofa",
            "length": "6",
            "width": "4",
            "height": "3",
            "weight": "100",
            "value": "500"
        }
    ]
};
const items_missing_value = {
    "items": [{
            "name": "fridge",
            "length": "3",
            "width": "4",
            "height": "6",
            "weight": "300",
        },
        {
            "name": "sofa",
            "length": "6",
            "width": "4",
            "height": "3",
            "weight": "100",
            "value": "500"
        }
    ]
};

let items_150 = {
    "items": []
}
for (let i = 0; i < 75; i++) {
    let item1 = {
        "name": "sofa",
        "length": "6",
        "width": "4",
        "height": "3",
        "weight": "100",
        "value": "500"
    }
    let item2 = {
        "name": "fridge",
        "length": "3",
        "width": "4",
        "height": "6",
        "weight": "300",
    }
    items_150.items.push(item1);
    items_150.items.push(item2);
}



describe('/POST pricing endpoint', () => {
    describe('for random customer pricing', () => {
        it('it should return unit price for random customer except A, B, C, D, unit price should be 20 since no flat fee is initiated', (done) => {
            chai.request(app).post('/pricing?customer_name=vincent').end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE);
                done();
            });
        });
        it('it should return specific unit price for random customer except A, B, C, D, unit price should be the same as initiated', (done) => {
            chai.request(app).post('/pricing?customer_name=Vincent&flat_fee=10').end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(10);
                done();
            });
        });
        it('it should return error code 400 since no username is provided for caculating pricing', (done) => {
            chai.request(app).post('/pricing').end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
    });

    describe('for customer A pricing', () => {
        it('it should return unit price object for customer A, unit price for A is default 20*0.9 = 18', (done) => {
            chai.request(app).post('/pricing?customer_name=A').end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE*0.9);
                done();
            });
        });
    })

    describe('for customer B pricing', () => {
        it('it should return error code 400 since not enough information to caculate pricing for customer B', (done) => {
            chai.request(app).post('/pricing?customer_name=B').end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
        it('it should return error code 400 since missing essential item information to caculate pricing for customer B', (done) => {
            chai.request(app).post('/pricing?customer_name=B').set('content-type', 'application/json').send(item_missing_info).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });


        it('it should return unit price object for customer B, unit price for B is flat fee plus per unit of volume', (done) => {
            chai.request(app).post('/pricing?customer_name=B').set('content-type', 'application/json').send(item).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE + (item.item.length*item.item.height*item.item.width));
                done();
            });
        });
    });

    describe('for customer C priving', () => {
        it('it should return error code 400 since not enough information to caculate pricing for customer C', (done) => {
            chai.request(app).post('/pricing?customer_name=C').end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
        it('it should return unit price object for customer C, unit price for C is flat fee plus 5% of itme value', (done) => {
            chai.request(app).post('/pricing?customer_name=C').set('content-type', 'application/json').send(item).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE + (0.05*item.item.value));
                done();
            });
        });
        it('should return error code 400 since missing item"s value for caculate pricing for customer C', (done) => {
            chai.request(app).post('/pricing?customer_name=C').set('content-type', 'application/json').send(item_missing_value).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
    });

    describe('for customer D pricing', () => {
        it('it should return error code 400 since no current inventory is provieded', (done) => {
            chai.request(app).post('/pricing?customer_name=D').end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
        it('it should return unit price for customer D when the new item is the first 100 items which is 5% off', (done) => {
            chai.request(app).post('/pricing?customer_name=D&current_inventory=99').end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE * 0.95);
                done();
            });
        });
        it('it should return unit price for customer D when the new item is the next 100 items which is 10% off', (done) => {
            chai.request(app).post('/pricing?customer_name=D&current_inventory=199').end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE * 0.9);
                done();
            });
        });
        it('it should return 400 since no item info is provided when current invertory has over 200 items', (done) => {
            chai.request(app).post('/pricing?customer_name=D&current_inventory=200').end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });

        it('it should return 400 since missing essential item info when current invertory has over 200 items', (done) => {
            chai.request(app).post('/pricing?customer_name=D&current_inventory=200').set('content-type', 'application/json').send(item_missing_info).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });

        it('it should return pricing for customer D when current invertory has over 200 items', (done) => {
            chai.request(app).post('/pricing?customer_name=D&current_inventory=200').set('content-type', 'application/json').send(item).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal((FLAT_FEE * 0.85) + (item.item.length * item.item.width * item.item.height * 2));
                done();
            });
        });

    });
});


describe('/POST quote endpoint', () => {
    describe('for random customer get quote', () => {
        it('it should return status code 400 since no customer name is provided', (done) => {
            chai.request(app).post('/quote').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
        it('it should return quote object with the total price for storgaed items list, unit price is default unit price', (done) => {
            chai.request(app).post('/quote?customer_name=vincent').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
        });
        it('it should return quote object with the total price for storgaed items list, unit price is same as initialed price', (done) => {
            chai.request(app).post('/quote?customer_name=vincent&flat_fee=10').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
        });
        it('it should return status 400 since no storaged item list is provided for caculating price', (done) => {
            chai.request(app).post('/quote?customer_name=vincent').end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });

        it('it should return status 400 since empty items list is provided', (done) => {
            chai.request(app).post('/quote?customer_name=vincent&flat_fee=10').set('content-type', 'application/json').send(items_empty).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
    });
    describe("for customer A get quote", () => {
        it('it should return quote object with the total price based on customer A"s unit price ', (done) => {
            chai.request(app).post('/quote?customer_name=A').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
        });
    });
    describe("for customer B get quote", () => {
        it('it should return quote object with the total price based on customer B"s unit price ', (done) => {
            chai.request(app).post('/quote?customer_name=B').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
        });

        it('it should return status 400 since missing item information to get quote for customer B ', (done) => {
            chai.request(app).post('/quote?customer_name=B').set('content-type', 'application/json').send(items_missing_info).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
    });

    describe("for customer C get quote", () => {
        it('it should return quote object with the total price based on customer C"s unit price ', (done) => {
            chai.request(app).post('/quote?customer_name=C').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
        });

        it('it should return status 400 since missing item information to get quote for customer C ', (done) => {
            chai.request(app).post('/quote?customer_name=C').set('content-type', 'application/json').send(items_missing_value).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
    });

    describe("for customer D get quote", () => {
        it('it should return quote object with the total price based on customer C"s unit price ', (done) => {
            chai.request(app).post('/quote?customer_name=C').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
        });

        it('it should return status 400 since missing item information to get quote for customer C ', (done) => {
            chai.request(app).post('/quote?customer_name=C').set('content-type', 'application/json').send(items_missing_value).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
    });

    describe('for customer D get quote', () => {
        it('it should return error code 400 since no current inventory is provieded', (done) => {
            chai.request(app).post('/quote?customer_name=D').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
        it('it should return the quote customer D when the all of the new item is the first 100 items which is 5% off', (done) => {
            chai.request(app).post('/quote?customer_name=D&current_inventory=50').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE * 0.95 * items.items.length);
                done();
            });
        });
        it('it should return the quote customer D when part of new items are in the first 100 and the rest are in the next 100', (done) => {
            chai.request(app).post('/quote?customer_name=D&current_inventory=99').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal((FLAT_FEE * 0.95 * (100-99)) + (FLAT_FEE*0.9*(items.items.length-100+99)));
                done();
            });
        });
        it('it should return the quote customer D when all new items are next 100', (done) => {
            chai.request(app).post('/quote?customer_name=D&current_inventory=100').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                expect(res.body.price).to.equal(FLAT_FEE * 0.9 * items.items.length);
                done();
            });
        });

        it('it should return the quote customer D when part of new items are in the first 100 and 100 new items are in the next 100 and the rest are additional', (done) => {
            chai.request(app).post('/quote?customer_name=D&current_inventory=75').set('content-type', 'application/json').send(items_150).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                let price = 0;
                for(let i=0; i<items_150.items.length; i++){
                    if(i<100-75){
                        price += FLAT_FEE*0.95;
                    } else if(i >= 100-75 && i < 100-75+100){
                        price += FLAT_FEE*0.9;
                    } else {
                        price += ((FLAT_FEE*0.85) + (items_150.items[i].height*items_150.items[i].width*items_150.items[i].length)*2)
                    }
                }
                expect(res.body.price).to.equal(price);
                done();
            });
        });

        it('it should return the quote customer D when part of new items are in the next 100 and rest are additional', (done) => {
            chai.request(app).post('/quote?customer_name=D&current_inventory=199').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                let price = 0;
                for(let i=0; i<items.items.length; i++){
                    if(i<200-199){
                        price += FLAT_FEE*0.9;
                    } else {
                        price += (FLAT_FEE*0.85) + (items.items[i].length * items.items[i].width * items.items[i].height * 2);
                    }
                }
                expect(res.body.price).to.equal(price);
                done();
            });
        });
        it('it should return the quote customer D when all of new items are are additional', (done) => {
            chai.request(app).post('/quote?customer_name=D&current_inventory=200').set('content-type', 'application/json').send(items).end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("price");
                let price = 0;
                for(let i=0; i<items.items.length; i++){
                    let unit_price = (FLAT_FEE * 0.85) + (items.items[i].length * items.items[i].width * items.items[i].height * 2);
                    console.log(unit_price);
                    price += unit_price;
                }
                expect(res.body.price).to.equal(price);
                done();
            });
        });
        it('it should return bad status code 400 since item in item list missing essential info for getting quote for customer D when part of new items are additional', (done) => {
            chai.request(app).post('/quote?customer_name=D&current_inventory=200').set('content-type', 'application/json').send(items_missing_info).end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
        });
    });
});

describe('error endpoint', () => {
    it('it should return status 404 for unable handling request ', (done) => {
        chai.request(app).post('/quoteeeeeee?customer_name=C').set('content-type', 'application/json').send(items).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
});