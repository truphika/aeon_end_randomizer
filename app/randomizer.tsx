import { Box, Button, Card, Columns, Container, Image, Message, Modal, Notification } from "react-bulma-components";
import market_setup from "../data/market.json"
import outcasts_data from "../data/Outcasts.json"
import sd_data from "../data/Shattered_Dreams.json"
import expedition_market from "../data/expedition_market.json"
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

type Nemesis = {
    dificulty: string;
    fight: string;
    name: string;
    uuid: string;
    img: string;
}

type Mage = {
    name: string;
    uuid: string;
    img: string;
}

type Card = {
    type: string,
    cost: string,
    uuid: string,
    img: string,
    is_supply_card: boolean,
}

type Barrack = {
    market: Card[];
    mages: Mage[];
    treasures: Card[];
}

const all_cards = outcasts_data.cards.concat(sd_data.cards)
const all_mages = outcasts_data.mages.concat(sd_data.mages)
const all_nemeses = outcasts_data.nemeses.concat(sd_data.nemeses)

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

function randomize(barracks: Barrack, number_player = 2, expedition_level = 1) {
    const random_market = market_setup[Math.floor(Math.random() * market_setup.length)]
    const market = expedition_level == 1 ? random_market : expedition_market
    return {
        market: choose_market(market, barracks.market),
        mages: choose_mages(number_player, barracks.mages),
        nemesis: choose_nemesis(expedition_level),
        treasures: choose_treasures(expedition_level, barracks.treasures)
    }
}

function choose_treasures(expedition_level: number, alreadyChoosenTreasures: Card[]) {
    if (expedition_level == 1) {
        return []
    }

    const choosenTreasures: Card[] = []
    const numberTreasures = expedition_level == 3 ? 3 : 5
    Array(numberTreasures).keys().forEach(() => {
        const allowedTreasures = all_cards.filter(card =>
            card.type == `Treasure Level ${expedition_level - 1}` &&
            choosenTreasures.every(treasure => treasure.uuid !== card.uuid) &&
            alreadyChoosenTreasures.every(treasure => treasure.uuid !== card.uuid)
        )

        choosenTreasures.push(allowedTreasures[Math.floor(Math.random() * allowedTreasures.length)])
    })

    return choosenTreasures
}

function choose_nemesis(nemesis_level = 1): Nemesis {
    const allowed_nemesis = all_nemeses.filter(nemesis => parseInt(nemesis.fight) == nemesis_level)

    return allowed_nemesis[Math.floor(Math.random() * allowed_nemesis.length)]
}

function choose_mages(number_player: number, alreadyChoosenMages: Mage[]) {
    const mages: Mage[] = []
    Array(number_player).keys().forEach(() => {
        const allowed_mages = all_mages.filter(mage =>
            mages.every(choosen_mages => choosen_mages.uuid !== mage.uuid) &&
            alreadyChoosenMages.every(choosen_mages => choosen_mages.uuid !== mage.uuid)
        )

        mages.push(allowed_mages[Math.floor(Math.random() * allowed_mages.length)])
    })

    return mages
}

function choose_market(market: MarketCard[], alreadyChoosenCards: Card[]) {
    const cards: Card[] = []
    market.forEach((market_card: MarketCard) => {
        const allowed_cards = all_cards.filter((card: Card) =>
            isMarketConditionOk(card, market_card) &&
            card.is_supply_card == true &&
            cards.every(choosen => choosen.uuid !== card.uuid) &&
            alreadyChoosenCards.every(choosen => choosen.uuid !== card.uuid
            )
        )
        cards.push(allowed_cards[Math.floor(Math.random() * allowed_cards.length)])
    })

    console.log("New Market", cards.map(c => c.uuid))

    return cards
}

export default function Randomizer() {
    const newBarrack: Barrack = {mages: [], market: [], treasures: []}

    const [barracks, setBarracks] = useState<Barrack >(newBarrack)
    const [market, setMarket] = useState<Card[] | undefined[]>(Array(9).fill(undefined))
    const [mages, setMages] = useState<Mage[] | undefined[]>(Array(2).fill(undefined))
    const [nemesis, setNemesis] = useState<Nemesis | undefined>(undefined)
    const [treasures, setTreasures] = useState<Card[]>([])
    const [expeditionLevel, setExpeditionLevel] = useState(1)
    const [showDefeatNotification, setShowDefeatNotification] = useState(false)

    const randomizeAll = (newExpeditionLevel = 1) => {
        console.log("Randomize For Expedition Level " + newExpeditionLevel)
        console.log("Current Barrack ", barracks)

        if (newExpeditionLevel == 1) {
            setBarracks(newBarrack)
            barracks.market = []
            barracks.mages = []
            barracks.treasures = []
        }

        const randomized = randomize(barracks, 2, newExpeditionLevel)
        if (newExpeditionLevel == 1) {
            setMages(randomized.mages)
        }
        setMarket(randomized.market)
        setNemesis(randomized.nemesis)
        setTreasures(randomized.treasures)

        setBarracks({
            market: barracks.market.concat(randomized.market),
            mages: randomized.mages,
            treasures: barracks.treasures.concat(randomized.treasures),
        })

        setExpeditionLevel(newExpeditionLevel)
    }

    if (expeditionLevel == 5) {
        return <Box>
            <Container className="has-text-centered">
                <Message>GG</Message>
                <Button color="info" onClick={() => randomizeAll(1)}>Reset</Button>
            </Container>
        </Box>
    }

    return <Box>
        <div className={`modal ${showDefeatNotification ? "is-active" : ""}`}>
            <div className="modal-background" onClick={() => setShowDefeatNotification(false)}></div>
            <div className="modal-content">
                <Card><Card.Content>Test</Card.Content></Card>
            </div>
        </div>
        <Columns>
            <Columns.Column>
                <div className="fixed-grid has-3-cols">
                    <div className="grid">
                        {market.filter(market_card => market_card !== undefined).map((market_card) =>
                            <Image key={market_card.uuid} style={{ width: "50%" }} alt={market_card?.uuid} src={`/cards/${market_card.uuid}.jpg`} ></Image>
                        )}
                        {treasures.map((treasure) =>
                            <Image key={treasure.uuid} style={{ width: "50%" }} alt={treasure?.uuid} src={`/cards/${treasure.uuid}.jpg`} ></Image>
                        )}
                        <div></div>
                    </div>
                </div>
            </Columns.Column>
            <Columns.Column>
                {nemesis !== undefined ? <Image
                    key={nemesis.uuid} style={{ width: "40%" }} alt={nemesis?.uuid} src={`/cards/${nemesis.uuid}.jpg`} >
                    </Image> : <></>}
                {mages.filter(mage => mage !== undefined).map((mage) =>
                    <Image key={mage.uuid} style={{ width: "40%" }} alt={mage?.uuid} src={`/cards/${mage.uuid}.jpg`} ></Image>
                )}
            </Columns.Column>
        </Columns>
        <Container className="has-text-centered">
            <Button color={"info"} onClick={() => randomizeAll()} style={{ margin: "auto" }}>
                {market.every(c => c === undefined) ? "Randomize" : "Re-Roll"}
            </Button>
            {market.every(c => c === undefined) ? <></> : 
                <Button color={"danger"} onClick={() => setShowDefeatNotification(true)} className="mx-1">Defeat</Button>
            }
            {market.every(c => c  === undefined) ? <></> :
                <Button color={"success"} onClick={() => randomizeAll(expeditionLevel + 1)} style={{ margin: "auto" }}>Victory</Button>
            }
        </Container>
    </Box>
}