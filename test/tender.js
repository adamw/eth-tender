const Tender = artifacts.require("Tender");

const Hash1 = "9ac86698255146a92e31a8cf0e1163682cf28b81475bafd9b9fcaa34d7a1f0b516dd1340725aebc19dce5febd49446c1acf28ae04493ba020990cfad98638e3d";
const Hash2 = "4acda328625d64b519693e1ccbed82f4da8c3f46b31be6bf917e893c566d568b2f5cf7b1bd093d63fde8cdf583216534f43be314135f4e4690155b4f1b38765b";

contract('Tender', (accounts) => {
  it('should submit an offer', async () => {
    const tenderInstance = await Tender.new(Math.round(Date.now() / 1000) + 10);
    await tenderInstance.submitOffer(Hash1, { from: accounts[0] });
    await tenderInstance.submitOffer(Hash2, { from: accounts[1] });

    const submitted1 = await tenderInstance.submittedOffers.call(1);
    const submitted2 = await tenderInstance.submittedOffers.call(2);
    const submitted3 = await tenderInstance.submittedOffers.call(3);
    
    assert.equal(submitted1.offerHash, Hash1);
    assert.equal(submitted1.bidder, accounts[0]);

    assert.equal(submitted2.offerHash, Hash2);
    assert.equal(submitted2.bidder, accounts[1]);
    
    assert.equal(submitted3.offerHash, "");
  });

  it('should not submit a double offer', async () => {
    const tenderInstance = await Tender.new(Math.round(Date.now() / 1000) + 10);
    await tenderInstance.submitOffer(Hash1, { from: accounts[0] });

    try {
      await tenderInstance.submitOffer(Hash2, { from: accounts[0] });
      throw null;      
    }
    catch (error) {
      assert.equal(error, "Error: Returned error: VM Exception while processing transaction: revert");
    }

    const submitted1 = await tenderInstance.submittedOffers.call(1);
    const submitted2 = await tenderInstance.submittedOffers.call(2);
    assert.equal(submitted1.offerHash, Hash1);
    assert.equal(submitted2.offerHash, "");
  });

  it('should not allow submitting after the end date', async() => {
    const tenderInstance = await Tender.new(Math.round(Date.now() / 1000) - 10);
    
    try {
      await tenderInstance.submitOffer(Hash1, { from: accounts[0] });
      throw null;      
    }
    catch (error) {
      assert.equal(error, "Error: Returned error: VM Exception while processing transaction: revert");
    }
  });
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
