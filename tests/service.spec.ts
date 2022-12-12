// Unit tests using mocha and chai for the economic service
import {Context} from "koishi";
import {expect} from 'chai';
import MemoryDatabase from '@koishijs/plugin-database-memory';
//@ts-ignore
import * as EconomicPlugin from "../src";

declare module "../src"{
  interface Currencies{
    test: number
  }
}

describe('Economic Service', function () {
  let app: Context = null
  beforeEach(async function () {
    app = new Context()
    await app.start()
    app.plugin(MemoryDatabase)
    app.plugin(EconomicPlugin)
    await new Promise((resolve) => app.using(['database','economic'], resolve))
    app.economic.extends("test")
    await app.database.create("user",{id:1})
    await app.database.create("user",{id:2})
  });

  it("Should be able to create a new currency", async function () {
    app.economic.extends("test")
  });

  it("Should be able to add money to a user", async function () {
    await app.economic.add("test",1,100,"test")
    const user = await app.database.get("user",{id:1})
    expect(user[0].test).to.equal(100)
  })

  it("Should be able to cost money from a user", async function () {
    await app.economic.add("test",1,100,"test")
    await app.economic.cost("test",1,50,"test")
    const user = await app.database.get("user",{id:1})
    expect(user[0].test).to.equal(50)
  })

  it("Should be able to transfer money from a user to another", async function () {
    await app.economic.add("test",1,100,"test")
    await app.economic.transfer("test",1,2,50,"test")
    const user1 = await app.database.get("user",{id:1})
    const user2 = await app.database.get("user",{id:2})
    expect(user1[0].test).to.equal(50)
    expect(user2[0].test).to.equal(50)
  });


  it("Should be able to get user balance", async function () {
    await app.economic.add("test",1,100,"test")
    const balance = await app.economic.get("test",1)
    expect(balance).to.equal(100)
  })

  it("Should be able to set user balance", async function () {
    await app.economic.set("test",1,100,"test")
    const balance = await app.economic.get("test",1)
    expect(balance).to.equal(100)
  });

  it("Should be able to revert a transaction", async function () {
    await app.economic.add("test",1,100,"test")
    const transaction = await app.economic.transfer("test",1,2,50,"test")
    await app.economic.revert(transaction)
    const balance1 = await app.economic.get("test",1)
    const balance2 = await app.economic.get("test",2)
    expect(balance1).to.equal(100)
    expect(balance2).to.equal(0)
  });

  

  afterEach(async function () {
    await app.stop()
  });

})