#!/usr/bin/env python3
"""
Utility to convert miscellaneous IC Joshi meteorology question sets
into practice JSON files consumed by the frontend.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List, Any

BASE_DIR = Path(__file__).resolve().parent.parent
PRACTICE_DIR = BASE_DIR / "practice-questions"
DATA_FILE = BASE_DIR / "data" / "ic-joshi-meteorology-misc-questions.json"

RAW_JSON = r"""{



  "book_title": "MET_IC_Joshi_7 Edition",

  "data": [

    {

      "chapter_title": "MISCELLANEOUS QUESTIONS",

      "chapter_number": "N/A",

      "questions": [

        {

          "question_number": "Q1",

          "question_text": "Translucent rime ice forms due to",

          "question_type": "MCQ",

          "options": [

            "(a) Melting of large snow particles",

            "(b) Freezing of large supercooled water drops",

            "(c) Freezing of small supercooled water drops",

            "(d) Sublimation of large hail"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q2",

          "question_text": "Advection fog occurs due to air moving over surface over",

          "question_type": "MCQ",

          "options": [

            "(a) Dry, wet, land only",

            "(b) Moist and cold, warm, land only",

            "(c) Warm & moist air, cold, both land & sea."

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q3",

          "question_text": "ELR $6.5^{\circ}C$ and SALR $7^{\circ}C$ on lifting a saturated parcel of air the atmosphere would be",

          "question_type": "MCQ",

          "options": [

            "(a) Stable",

            "(b) Absolutely stable",

            "(c) Absolutely unstable",

            "(d) Indifferent"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q4",

          "question_text": "Gradient wind is weaker than geostrophic wind around a low because",

          "question_type": "MCQ",

          "options": [

            "(a) Centripetal force is provided by pressure gradient force",

            "(b) Centripetal force is added to the pressure gradient force",

            "(c) Coriolis force is added to the pressure gradient force",

            "(d) Coriolis force is opposite to Centripetal"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q5",

          "question_text": "The altimeter of an aircraft is set to QFE before landing, on landing it will indicate",

          "question_type": "MCQ",

          "options": [

            "(a) Height of A/C wheels above runway",

            "(b) Flight Level",

            "(c) A/C altitude AMSL",

            "(d) Height of A/C above ARP in ISA"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q6",

          "question_text": "TAF generally has a validity of......... hr and TREND",

          "question_type": "MCQ",

          "options": [

            "(a) 9 hr; 2 hr",

            "(b) 24 hr; 3 hr",

            "(c) 12 hr; 2 hr",

            "(d) 24 hr; 9hr"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q7",

          "question_text": "CAT is most pronounced on which side of a subtropical jet stream",

          "question_type": "MCQ",

          "options": [

            "(a) About 3 km above the core",

            "(b) Cold side of core",

            "(c) South side of core",

            "(d) at core"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q8",

          "question_text": "Hail forms by collision with super-cooled water drops by",

          "question_type": "MCQ",

          "options": [

            "(a) Condensation",

            "(b) Deposition",

            "(c) Evaporation",

            "(d) Transpiration"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q9",

          "question_text": "Thermal wind blows parallel to keeping to the left",

          "question_type": "MCQ",

          "options": [

            "(a) Isotherms, low temperature",

            "(b) Isobars, low temperature",

            "(c) Isobars, low pressure",

            "(d) Isallobars, high temperature"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q10",

          "question_text": "Roaring Forties are winds blow throughout the year and are of very stormy nature in",

          "question_type": "MCQ",

          "options": [

            "(a) Wly, N hemisphere",

            "(b) Ely, S hemisphere",

            "(c) Wly, S hemisphere",

            "(d) Ely, S hemisphere"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q11",

          "question_text": "Temperature in the troposphere decreases from equator to poles. The thermal wind throughout troposphere is therefore and as height increases",

          "question_type": "MCQ",

          "options": [

            "(a) Wly, increases",

            "(b) Wly, decreases",

            "(c) Wly, remains same",

            "(d) Ely, increases"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q12",

          "question_text": "A Cold Front passes a station, the pressure",

          "question_type": "MCQ",

          "options": [

            "(a) Changes are very small",

            "(b) first increases and then decreases",

            "(c) First decreases and then increases",

            "(d) rises continually"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q13",

          "question_text": "Flying conditions associated with CB during pre monsoon are",

          "question_type": "MCQ",

          "options": [

            "(a) Continuous rain, poor visibility, light turbulence",

            "(b) Good visibility, drizzle, turbulence",

            "(c) Hail, gusts, shower, and severe turbulence",

            "(d) Rain, poor visibility, and turbulence"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q14",

          "question_text": "Which is true of a cold front",

          "question_type": "MCQ",

          "options": [

            "(a) Less steeper than a warm front",

            "(b) Associated with continuous rain and ST clouds",

            "(c) Heavy convective weather and squall line",

            "(d) Similar slope as warm front"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q15",

          "question_text": "The observed temperature is - $40^{\circ}C$ at FL 300 (10 km). It is termed as",

          "question_type": "MCQ",

          "options": [

            "(a) 10 deg C warmer than ISA",

            "(b) 10 deg C colder than ISA",

            "(c) 15 deg C warmer than ISA",

            "(d) 15 deg C colder than ISA"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q16",

          "question_text": "Aquaplaning may occur in",

          "question_type": "MCQ",

          "options": [

            "(a) - GR",

            "(b) +RA",

            "(c) -TS",

            "(d) Thick Fog"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q17",

          "question_text": "CAT is most likely to be encountered in",

          "question_type": "MCQ",

          "options": [

            "(a) A high close to a Dust Storm",

            "(b) After the passage of a severe Sandstorm",

            "(c) A sharp trough aloft with winds of jet stream speed",

            "(d) A ridge aloft"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q18",

          "question_text": "What are Norwesters",

          "question_type": "MCQ",

          "options": [

            "(a) Warm dry winds coming from NW",

            "(b) Severe Duststorm from NW",

            "(c) TS affecting NW India in premonsoon",

            "(d) TS of E and NE India in premonsoon"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q19",

          "question_text": "Example of non frontal stability is",

          "question_type": "MCQ",

          "options": [

            "(a) Squall line",

            "(b) Inversion",

            "(c) Frontogenesis",

            "(d) Occlusion"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q20",

          "question_text": "If temperature initially is constant and then increases with height, the atmosphere is",

          "question_type": "MCQ",

          "options": [

            "(a) Stable",

            "(b) Unstable",

            "(c) Indifferent",

            "(d) Adiabatic"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q21",

          "question_text": "Under what conditions severe icing is encountered",

          "question_type": "MCQ",

          "options": [

            "(a) temperature $0^{\circ}C$",

            "(b) rain and temperature below $-10^{\circ}C$",

            "(c) visible vapour and temperature $-5^{\circ}C$",

            "(d) rain at temperature $-20^{\circ}C$"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q22",

          "question_text": "Select the correct answer:",

          "question_type": "MCQ",

          "options": [

            "(a) The level from ground to freezing level is more susceptible for icing",

            "(b) Most potent area for dangerous icing is freezing level to about 25,000 ft",

            "(c) Icing may be severe in the temperature range - 20 to $-40^{\circ}C$",

            "(d) Severe icing may form in the temperature range - 10 to $30^{\circ}C$"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q23",

          "question_text": "Ice accretion",

          "question_type": "MCQ",

          "options": [

            "(a) increases drag but reduces stalling speed",

            "(b) alters aerodynamics, reduces weight, and decrease lift",

            "(c) alters aerodynamics, increases weight and lift",

            "(d) increases drag and weight and stalling speed"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q24",

          "question_text": "The wind 260102 KT, is reported in a METAR / SPECI as:",

          "question_type": "MCQ",

          "options": [

            "(a) $26010 KT + 26002 KT$",

            "(b) 260P99 KT only",

            "(c) Only in remark column",

            "(d) 260P99 KT and complete wind in remark column"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q25",

          "question_text": "Will SPECI be issued if",

          "question_type": "MCQ",

          "options": [

            "(a) Wind changes from 27010 KT to 29018KT",

            "(b) RVR changes, from 1400 m to 1600 m",

            "(c) Visibility changes from 6000 m to 4000 m",

            "(d) Temperature changes from 15 to $16^{\circ}C$"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q26",

          "question_text": "CAVOK in a METAR replaces",

          "question_type": "MCQ",

          "options": [

            "(a) Visibility, cloud and Wx groups",

            "(b) Wind, visibility & cloud groups",

            "(c) Wind, temp & pressure groups",

            "(d) Visibility, temp & cloud groups"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q27",

          "question_text": "The calm and clear night is cooler than cloudy night because :",

          "question_type": "MCQ",

          "options": [

            "(a) Clouds prevent terrestrial radiation from escaping",

            "(b) Clouds radiate heat towards sky",

            "(c) Due to $CO_2$ and $H_2O$ present in the air",

            "(d) Terrestrial radiation skip through clouds"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q28",

          "question_text": "Diurnal variation of temperature is least",

          "question_type": "MCQ",

          "options": [

            "(a) When sky is clear",

            "(b) During land breeze over the coastal areas",

            "(c) When sky is overcast",

            "(d) When winds are weak over the land surface"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q29",

          "question_text": "Density altitude is",

          "question_type": "MCQ",

          "options": [

            "(a) Higher if atmosphere is warmer than ISA",

            "(b) Lower if atmosphere is warmer than ISA",

            "(c) Higher if atmosphere is colder than ISA",

            "(d) Higher if atmosphere is isothermal"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q30",

          "question_text": "The temperature to which air should be cooled to saturate it is",

          "question_type": "MCQ",

          "options": [

            "(a) Wet bulb",

            "(b) Dew point",

            "(c) Dry bulb temperature",

            "(d) Ambient"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q31",

          "question_text": "No cyclonic storm or high pressure systems form within $5^{\circ}$ of the equator because",

          "question_type": "MCQ",

          "options": [

            "(a) Pressure gradient force is negligible",

            "(b) Frictional force is minimal",

            "(c) Coriolis force is negligible",

            "(d) Geotropic force is maximum"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q32",

          "question_text": "Gradient wind",

          "question_type": "MCQ",

          "options": [

            "(a) Is due to the balance between Pressure gradient force and Friction",

            "(b) Is super geostrophic in a low and subgeostrophic in a high",

            "(c) Is due to the balance between Pressure gradient, Coriolis and Centripetal forces",

            "(d) Blows parallel to straight isobars"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q33",

          "question_text": "Effect of Wind Shear",

          "question_type": "MCQ",

          "options": [

            "(a) Decreasing head wind increases lift",

            "(b) Increasing tail wind increases lift",

            "(c) Decreasing tail wind increases lift and a/c rises above the glide path",

            "(d) Weakening head wind raises aircraft above the flight path"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q34",

          "question_text": "Due to friction the wind",

          "question_type": "MCQ",

          "options": [

            "(a) Strengthens and backs during landing",

            "(b) Decreases and backs during landing",

            "(c) Strengthens and backs during take off",

            "(d) Decreases and veers during landing"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q35",

          "question_text": "The term 'monsoon' means",

          "question_type": "MCQ",

          "options": [

            "(a) Seasonal reversal of winds and rainfall",

            "(b) Rains all over India",

            "(c) One of the four seasons with maximum rain in the N",

            "(d) Monsoon circulation"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q36",

          "question_text": "The two main seasons in India are",

          "question_type": "MCQ",

          "options": [

            "(a) Pre monsoon and SW monsoon",

            "(b) Winters and Hot season",

            "(c) Hot season and Rainy season",

            "(d) Winter and SW monsoon"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q37",

          "question_text": "The main cause of seasons in India is",

          "question_type": "MCQ",

          "options": [

            "(a) Oscillation of sun $23\frac{1}{2}^{\circ}N$ to $23\frac{1}{2}^{\circ}S$",

            "(b) Advection of air from Arabian sea",

            "(c) Thermal equator at equator whole year",

            "(d) Earth rotating around its own axis 2"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q38",

          "question_text": "The axis of monsoon trough runs",

          "question_type": "MCQ",

          "options": [

            "(a) In the Bay of Bengal",

            "(b) Along the Gangetic plains",

            "(c) Along 22 deg East to West of India",

            "(d) Along central peninsula"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q39",

          "question_text": "During monsoon season the low level winds are",

          "question_type": "MCQ",

          "options": [

            "(a) SEly along E coast",

            "(b) NEly over Tamil Nadu",

            "(c) SEly over Bay of Bengal",

            "(d) SEly North of Monsoon Trough"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q40",

          "question_text": "During SW monsoon the winds above 500 hPa are",

          "question_type": "MCQ",

          "options": [

            "(a) Ely over S and weak Wly over N India",

            "(b) Wly over S and strong over N India",

            "(c) Wly over S and weak Wly over N India",

            "(d) Strong Ely over S and weak over N India"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q41",

          "question_text": "Which is not true of post monsoon",

          "question_type": "MCQ",

          "options": [

            "(a) Pressure gradient is weakest of all seasons",

            "(b) Frequency of tropical cyclones is max.",

            "(c) Monsoon withdraws from the country",

            "(d) Worst period for flying expect S India"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q42",

          "question_text": "The months during which Tamil Nadu gets most of its rainfall are",

          "question_type": "MCQ",

          "options": [

            "(a) Oct-Nov",

            "(b) Jul-Sep",

            "(c) Apr-Jun",

            "(d) Dec - Mar"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q43",

          "question_text": "ITCZ affects weather over India during",

          "question_type": "MCQ",

          "options": [

            "(a) Winters only",

            "(b) Pre-monsoon only",

            "(c) Monsoons only",

            "(d) All the four seasons"

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q44",

          "question_text": "ESNO is the name given to",

          "question_type": "MCQ",

          "options": [

            "(a) El Nino only",

            "(b) Southern oscillations and La- Nino",

            "(c) El Nino and Southern oscillations",

            "(d) El Nino and La - Nino combined"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q45",

          "question_text": "Friction causes winds to get deflected",

          "question_type": "MCQ",

          "options": [

            "(a) Parallel to isobars",

            "(b) Towards low",

            "(c) Perpendicular to isobars",

            "(d) Towards high"

          ],

          "answer": "(b)"

        },

        {

          "question_number": "Q46",

          "question_text": "Station level pressure at ARP is reduced to MSL as per",

          "question_type": "MCQ",

          "options": [

            "(a) ISA is QFF",

            "(b) ISA is QFE",

            "(c) Isothermal is QNH",

            "(d) ISA is QNH."

          ],

          "answer": "(d)"

        },

        {

          "question_number": "Q47",

          "question_text": "A/C moving from west to east and is drifting northwards. Its altimeter will",

          "question_type": "MCQ",

          "options": [

            "(a) Under read",

            "(b) Over read",

            "(c) Reading will remain unchanged"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q48",

          "question_text": "Wind Shear in a TS is maximum",

          "question_type": "MCQ",

          "options": [

            "(a) Below the anvil",

            "(b) all sides of a CB",

            "(c) Beneath the cloud",

            "(d) in SW sector"

          ],

          "answer": "(c)"

        },

        {

          "question_number": "Q49",

          "question_text": "Difference between Airmass TS (AM TS) and Steady State TS (SS TS) is",

          "question_type": "MCQ",

          "options": [

            "(a) SS TS duration is more",

            "(b) AM TS duration is more",

            "(c) SS TS duration is less",

            "(d) AM TS occur in fronts"

          ],

          "answer": "(a)"

        },

        {

          "question_number": "Q50",

          "question_text": "In a line of TS there is a hole in the Radar echo, what would you infer",

          "question_type": "MCQ",

          "options": [

            "(a) No precipitation",

            "(b) Strong convective activity",

            "(c) Area free of clouds",

            "(d) A gap between two CBT"

          ],

          "answer": "(d)"

        }

      ]

    },

    {

      "chapter_title": "ADDITIONAL QUESTIONS - 1",

      "chapter_number": "N/A",

      "questions": [

        {

          "question_number": "1",

          "question_text": "The main cause of occurrence of weather over the earth surface is",

          "question_type": "MCQ",

          "options": [

            "(a) Advection of moist air",

            "(b) Changing pressure",

            "(c) Movement of air mass",

            "(d) Variation in insolation"

          ],

          "answer": "(c)"

        },

        }
      ]
    }
  ]
}"""

slug_map: Dict[str, Dict[str, str]] = {
    "MISCELLANEOUS QUESTIONS": {
        "slug": "miscellaneous-questions",
        "title": "Miscellaneous Questions",
    },
    "ADDITIONAL QUESTIONS - 1": {
        "slug": "additional-questions-1",
        "title": "Additional Questions - 1",
    },
    "ADDITIONAL QUESTIONS - 2": {
        "slug": "additional-questions-2",
        "title": "Additional Questions - 2",
    },
    "QUESTIONS ON MET SERVICES FOR AVIATION": {
        "slug": "questions-on-met-services-for-aviation",
        "title": "Questions on Met Services for Aviation",
    },
    "QUESTIONS ON METEOROLOGICAL AND BRIEFING": {
        "slug": "questions-on-meteorological-and-briefing",
        "title": "Questions on Meteorological and Briefing",
    },
    "QUESTIONS ON GENERAL CIRCULATION": {
        "slug": "questions-on-general-circulation",
        "title": "Questions on General Circulation",
    },
    "QUESTIONS ON METAR and SPECI": {
        "slug": "questions-on-metar-and-speci",
        "title": "Questions on METAR and SPECI",
    },
    "QUESTIONS ON STATION MODEL": {
        "slug": "questions-on-station-model",
        "title": "Questions on Station Model",
    },
    "AVATION WEATHER FORCAST": {
        "slug": "aviation-weather-forecast",
        "title": "Aviation Weather Forecast",
    },
    "AVATION WEATHER FORCAST (2)": {
        "slug": "aviation-weather-forecast-2",
        "title": "Aviation Weather Forecast (2)",
    },
}

OPTION_LABELS = list("abcdefghijklmnopqrstuvwxyz")


def parse_option(option_text: str, fallback_idx: int) -> Dict[str, str]:
    option_text = option_text.strip()
    match = re.match(r"^\(\s*([a-zA-Z])\s*\)\s*[\).:-]*\s*", option_text)
    letter = OPTION_LABELS[fallback_idx]
    if match:
        letter = match.group(1).lower()
        option_text = option_text[match.end():].strip()
    return {"letter": letter, "text": option_text or f"Option {letter.upper()}"}


def extract_answer_letter(answer: str) -> str:
    if not answer:
        return ""
    match = re.search(r"([a-zA-Z])", answer)
    return match.group(1).lower() if match else ""


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "item"


def build_question(chapter_slug: str, question: Dict[str, Any], index: int) -> Dict[str, Any]:
    qnum = str(question.get("question_number") or f"Q{index + 1}")
    parsed_options = [
        parse_option(opt, idx)
        for idx, opt in enumerate(question.get("options") or [])
    ]
    if not parsed_options:
        return {}

    answer_letter = extract_answer_letter(question.get("answer", ""))
    correct_idx = next(
        (idx for idx, opt in enumerate(parsed_options) if opt["letter"] == answer_letter),
        0,
    )

    options = [opt["text"] for opt in parsed_options]
    answer_label = OPTION_LABELS[correct_idx]
    qid = f"{chapter_slug}-{slugify(qnum)}"

    return {
        "id": qid,
        "question_number": qnum,
        "question": question.get("question_text", "").strip(),
        "question_type": question.get("question_type", "MCQ"),
        "options": options,
        "answer": answer_label,
        "solution": options[correct_idx] if options else "",
        "explanation": "",
    }


def main() -> None:
    raw_data = json.loads(RAW_JSON)
    Path(PRACTICE_DIR).mkdir(parents=True, exist_ok=True)

    if raw_data.get("book_title"):
        DATA_FILE.write_text(json.dumps(raw_data, indent=2), encoding="utf-8")

    generated = []
    for chapter in raw_data.get("data", []):
        title = chapter.get("chapter_title", "").strip()
        meta = slug_map.get(title)
        if not meta:
            print(f"[WARN] No slug mapping for chapter: {title}")
            continue

        questions: List[Dict[str, Any]] = []
        for idx, question in enumerate(chapter.get("questions") or []):
            built = build_question(meta["slug"], question, idx)
            if built:
                questions.append(built)
            else:
                print(f"[WARN] Skipping malformed question in chapter {title}: {question.get('question_number')}")

        payload = {
            "book_name": raw_data.get("book_title", "MET_IC_Joshi_7 Edition"),
            "chapter_number": chapter.get("chapter_number"),
            "chapter_title": meta["title"],
            "chapter_slug": meta["slug"],
            "source": "ic-joshi",
            "questions": questions,
        }

        outfile = PRACTICE_DIR / f"ic-joshi-{meta['slug']}.json"
        outfile.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        generated.append((meta["slug"], len(questions)))

    print("Generated practice files:")
    for slug, count in generated:
        print(f" - {slug}: {count} questions")


if __name__ == "__main__":
    main()

