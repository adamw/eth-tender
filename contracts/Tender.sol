pragma solidity >=0.4.25 <0.6.0;

contract Tender {
    struct Offer {
        address bidder;
        string offerHash;
        uint256 timestamp;
    }

    uint public offersCount;
    mapping (address => uint) public bidderToIndex; // to check who already submitted offers
    mapping (uint => Offer) public submittedOffers; // a sequence of submitted offers
    uint256 public dateEnd;

    event OfferSubmitted(address indexed _bidder, string _offerHash);

    constructor(uint256 _dateEnd) public {
        dateEnd = _dateEnd;
        offersCount = 0;
    }

    function submitOffer(string memory offerHash) public {
        require(now < dateEnd);
        //require(bidderToIndex[msg.sender] == 0);

        offersCount++;
        bidderToIndex[msg.sender] = offersCount;
        submittedOffers[offersCount] = Offer(msg.sender, offerHash, now);
        
        emit OfferSubmitted(msg.sender, offerHash);
    }
}
