import { Box, Button, Card, Columns, Container, Image } from "react-bulma-components";
import market_setup from "../data/market.json"
import outcasts_data from "../data/Outcasts.json"
import sd_data from "../data/Shattered_Dreams.json"
import { useState } from "react";

type MarketCondition = {
    eq?: number | undefined;
    lt_eq?: number | undefined;
    lt?: number | undefined;
    gt?: number | undefined;
    gt_eq?: number | undefined;
}

type MarketCard = {
    type: string,
    conditions?: MarketCondition
}

type Card = {
    type: string,
    cost: string,
    uuid: string,
    img: string
}

const all_cards = outcasts_data.cards.concat(sd_data.cards)

function isMarketConditionOk(card: Card, market_card: MarketCard) {
    if (market_card.type != card.type) {
        return false
    }
    if (!market_card.conditions) {
        return true
    }
    if (market_card.conditions?.eq && parseInt(card.cost) == market_card.conditions.eq) {
        return true
    }
    if (market_card.conditions?.gt && parseInt(card.cost) > market_card.conditions.gt) {
        return true
    }
    if (market_card.conditions?.gt_eq && parseInt(card.cost) >= market_card.conditions.gt_eq) {
        return true
    }
    if (market_card.conditions?.lt && parseInt(card.cost) < market_card.conditions.lt) {
        return true
    }
    if (market_card.conditions?.lt_eq && parseInt(card.cost) <= market_card.conditions.lt_eq) {
        return true
    }
    return false
}

function choose_market() {
    const choosen_card: Card[] = []
    market_setup[0].forEach((market_card: MarketCard) => {
        const allowed_cards = all_cards.filter((card: Card) =>
            isMarketConditionOk(card, market_card) &&
            choosen_card.every(choosen => choosen.uuid !== card.uuid)
        )
        choosen_card.push(allowed_cards[Math.floor(Math.random() * allowed_cards.length)])
    })

    console.log("New Market", choosen_card.map(c => c.uuid))
    return choosen_card
}

export default function Randomizer() {
    const [market, setMarket] = useState<Card[] | undefined[]>(Array(9).fill(undefined))

    return <Box>
        <div className="fixed-grid has-3-cols">
            <div className="grid">
                {market.filter(market_card => market_card !== undefined).map((market_card) => 
                        <Image key={market_card.uuid} style={{width: "50%"}} alt={market_card?.uuid} src={`/cards/${market_card.uuid}.jpg`} ></Image>
                )}
                <div></div>
            </div>
        </div>
        <Container className="has-text-centered">
        <Button color={"info"} onClick={() => setMarket(choose_market())}  style={{margin: "auto"}}>Randomize</Button>
        </Container>
    </Box>
}