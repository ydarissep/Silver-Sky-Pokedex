function regexSpecies(textSpecies, species){
    const lines = textSpecies.split("\n")
    let formsStart = null, ID = 0

    lines.forEach(line => {

        if (/#define *FORMS_START *\w+/i.test(line))
            formsStart = ID

        const matchSpecies = line.match(/#define *(SPECIES_\w+)/i)
        if(matchSpecies !== null && /SPECIES_NONE/i.test(line) !== true && /SPECIES_EGG/i.test(line) !== true){
            const name = matchSpecies[1]


            matchInt = line.match(/\d+/g)
            if(matchInt !== null){
                ID = parseInt(matchInt[matchInt.length-1])



                species[name] = {}
                species[name]["name"] = name


                if(Number.isInteger(formsStart))
                    species[name]["ID"] = ID+formsStart
                else
                    species[name]["ID"] = ID
            }
        }
    })
    return species
}









function regexBaseStats(textBaseStats, species){
    const lines = textBaseStats.split("\n")

    const regex = /baseHP|baseAttack|baseDefense|baseSpeed|baseSpAttack|baseSpDefense|type1|type2|itemCommon|itemRare|eggGroup1|eggGroup2|abilities/i
    let value, name, macroBaseStatsArray = {}, macro

    lines.forEach(line => {


        const matchMacro = line.match(/#define *(\w+_BASE_STATS)/i)
        if(matchMacro !== null){
             macro = matchMacro[1]
        }        

        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies !== null){
            name = matchSpecies[0]
        }


        if(name !== "SPECIES_NONE" && name !== "SPECIES_EGG"){
            const matchRegex = line.match(regex)
            if(matchRegex !== null){
                const match = matchRegex[0]



                if(match === "baseHP" || match === "baseAttack" || match === "baseDefense" || match === "baseSpeed" || match === "baseSpAttack" || match === "baseSpDefense"){
                    const matchInt = line.match(/\d+/)
                    if(matchInt !== null)
                        value = parseInt(matchInt[0])
                }
                else if(match === "type1" || match === "type2" || match === "itemCommon" || match === "itemRare" || match === "eggGroup1" || match === "eggGroup2"){
                    value = line.match(/\w+_\w+/i)
                    if(value !== null)
                        value = value[0]
                }
                else if(match === "abilities"){
                    value = line.match(/ABILITY_\w+/ig)
                }

                species[name][match] = value
            }
        }
    })
    return getBST(species)
}










function getLevelUpLearnsetsConversionTable(textLevelUpLearnsetsPointers){
    const lines = textLevelUpLearnsetsPointers.split("\n")
    let conversionTable = {}

    lines.forEach(line => {

        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies != null && /SPECIES_NONE/i.test(line) !== true){
            const value = matchSpecies[0]


            const matchConversion = line.match(/s\w+LevelUpLearnset/i)
            if(matchConversion !== null){
                const index = matchConversion[0]


                if(conversionTable[index] === undefined) // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index] = [value]
                else // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index].push(value)
            }
        }
    })
    return conversionTable
}

function regexLevelUpLearnsets(textLevelUpLearnsets, conversionTable, species){
    const lines = textLevelUpLearnsets.split("\n")
    let speciesArray = []

    lines.forEach(line => {
        const matchConversion = line.match(/s\w+LevelUpLearnset/i)
        if(matchConversion !== null){
            const index = matchConversion[0]
            if(index in conversionTable){
                speciesArray = conversionTable[index]
            }
        }


        const matchLevelMove = line.match(/(\d+) *, *(MOVE_\w+)/i)
        if(matchLevelMove !== null){
            const level = parseInt(matchLevelMove[1])
            const move = matchLevelMove[2]
            for(let i = 0; i < speciesArray.length; i++)
                species[speciesArray[i]]["levelUpLearnsets"].push([move, level])
        }
    })
    return species
}










function regexTMHMLearnsets(textTMHMLearnsets, species){
    const lines = textTMHMLearnsets.split("\n")
    let name = null

    lines.forEach(line => {
        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies !== null && !/SPECIES_NONE/i.test(line)){
            name = matchSpecies[0]
        }


        const matchTmhmMove = line.match(/TMHM\d* *\((\w+ *\d+) *_ *(\w+)/i)
        if(matchTmhmMove !== null && name !== null){
            const TMHM = matchTmhmMove[1]
            let move = matchTmhmMove[2]
            if(move === "SOLARBEAM")
                move = "SOLAR_BEAM" // Fuck Oldplayer :)
            move = `MOVE_${move}`

            species[name]["TMHMLearnsets"].push([move, TMHM])
        }
    })

    return altFormsLearnsets(species, "forms", "TMHMLearnsets")
}









function regexEvolution(textEvolution, species){
    const lines = textEvolution.split("\n")
    let name

    lines.forEach(line =>{

        const matchSpecies = line.match(/\[ *(SPECIES_\w+) *\]/i)
        if(matchSpecies !== null)
            name = matchSpecies[1]



        const matchEvoInfo = line.match(/(\w+), *(\w+), *(\w+)/)
        if(matchEvoInfo !== null){
            const method = matchEvoInfo[1]
            const condition = matchEvoInfo[2]
            const targetSpecies = matchEvoInfo[3]
            species[name]["evolution"].push([method, condition, targetSpecies])
        }
    })


    return getEvolutionLine(species)
}

function getEvolutionLine(species){
    for(let i = 0; i < 2; i++) // FUTURE ME DO NOT DARE QUESTION ME
    {
        for (const name of Object.keys(species)){

            for (let j = 0; j < species[name]["evolution"].length; j++){

                const targetSpecies = species[name]["evolution"][j][2]
                species[name]["evolutionLine"].push(targetSpecies)
            }



            for (let j = 0; j < species[name]["evolution"].length; j++){

                const targetSpecies = species[name]["evolution"][j][2]
                species[targetSpecies]["evolutionLine"] = species[name]["evolutionLine"]
            }
        }
    }

    for (const name of Object.keys(species))
        species[name]["evolutionLine"] = Array.from(new Set(species[name]["evolutionLine"])) // remove duplicates


    return species
}









function regexForms(textForms, species){
    const lines = textForms.split("\n")
    let speciesArray = []

    lines.forEach(line => {
        const matchSpecies = line.match(/SPECIES_\w+/i)
        
        if(/FORM_SPECIES_END/i.test(line)){
            for (let i = 0; i < speciesArray.length; i++)
                species[speciesArray[i]]["forms"] = speciesArray
            speciesArray = []
        }
        else if(matchSpecies !== null){
            const name = matchSpecies[0]
            speciesArray.push(name)
        }
    })
    return species
}








function regexEggMovesLearnsets(textEggMoves, species){
    const lines = textEggMoves.split("\n")
    const speciesString = JSON.stringify(Object.keys(species))
    let name = null

    lines.forEach(line => {
        if(/egg_moves/i.test(line))
            name = null
        const matchMove = line.match(/MOVE_\w+/i)
        if(matchMove !== null){
            const move = matchMove[0]
            if(name !== null)
                species[name]["eggMovesLearnsets"].push(move)
        }
        else if(name === null){
            const matchLine = line.match(/(\w+),/i)
            if(matchLine !== null){
                const testSpecies = `SPECIES_${speciesString.match(matchLine[1])}`
                if(speciesString.includes(testSpecies))
                    name = testSpecies
            }
        }
    })


    return altFormsLearnsets(species, "evolutionLine", "eggMovesLearnsets")
}









function getSpriteConversionTable(textFrontPicTable, species){
    const lines = textFrontPicTable.split("\n")
    const speciesString = JSON.stringify(Object.keys(species))
    let conversionTable = {}

    lines.forEach(line => {

        const matchConversionSpecies = line.match(/(\w+) *, *(gMonFrontPic_\w+)/i)
        if(matchConversionSpecies != null){

            const testSpecies = `SPECIES_${matchConversionSpecies[1]}`
            if(speciesString.includes(testSpecies)){
                const species = testSpecies
                const index = matchConversionSpecies[2]

                if(conversionTable[index] === undefined) // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index] = [species]
                else // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index].push(species)
            }
        }
    })
    return conversionTable
}

function regexSprite(textSprite, conversionTable, species){
    const lines = textSprite.split("\n")
    const conversionTableString = JSON.stringify(Object.keys(conversionTable))

    lines.forEach(line => {
        const matchgMonFrontPic = line.match(/gMonFrontPic_\w+/i)
        if(matchgMonFrontPic !== null){

            const conversion = matchgMonFrontPic[0]
            if(conversionTableString.includes(conversion)){
                const speciesArray = conversionTable[conversion]

                const matchPath = line.match(/graphics\/pokemon\/(\w+\/\w+\/\w+\/\w+\/\w+|\w+\/\w+\/\w+\/\w+|\w+\/\w+\/\w+|\w+\/\w+|\w+)\//i) // ¯\_(ツ)_/¯
                if(matchPath !== null){
                    const path = matchPath[1]
                    let url = `https://raw.githubusercontent.com/${repo}/graphics/pokemon/${path}/front.png`
                    if(url === "https://raw.githubusercontent.com/HunarPG/Pokemon-Silver-Sky/Silver-Sky/graphics/pokemon/castform/front.png"){
                        url = "https://raw.githubusercontent.com/HunarPG/Pokemon-Silver-Sky/Silver-Sky/graphics/pokemon/castform/normal/front.png"
                    }
                    else if(url === "https://raw.githubusercontent.com/HunarPG/Pokemon-Silver-Sky/Silver-Sky/graphics/pokemon/cherrim/front.png"){
                        url = "https://raw.githubusercontent.com/HunarPG/Pokemon-Silver-Sky/Silver-Sky/graphics/pokemon/cherrim/normal/front.png"
                    }
                    for(let i = 0; i < conversionTable[conversion].length; i++){
                        species[speciesArray[i]]["sprite"] = url
                    }
                }
            }
        }
    })
    return species
}










function regexTutorLearnsets(textTutorLearnsets, species){
    const lines = textTutorLearnsets.split("\n")
    let name = null

    lines.forEach(line => {
        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies !== null && !/SPECIES_NONE/i.test(line)){
            name = matchSpecies[0]
        }


        const matchTutorMove = line.match(/TUTOR *\( *(MOVE_\w+) *\)/i)
        if(matchTutorMove !== null && name !== null){
            let move = matchTutorMove[1]

            species[name]["tutorLearnsets"].push(move)
        }
    })

    return altFormsLearnsets(species, "forms", "tutorLearnsets")
}















function altFormsLearnsets(species, input, output){
    for (const name of Object.keys(species)){

        if(species[name][input].length >= 2){

                for (let j = 0; j < species[name][input].length; j++){
                    const targetSpecies = species[name][input][j]
                    

                    if(species[targetSpecies][output].length <= 0){
                        species[targetSpecies][output] = species[name][output]
                    }
                }
        }
    }
    return species
}


function getBST(species){
    for (const name of Object.keys(species)){
        const baseHP = species[name]["baseHP"]
        const baseAttack = species[name]["baseAttack"]
        const baseDefense = species[name]["baseDefense"]
        const baseSpAttack = species[name]["baseSpAttack"]
        const baseSpDefense = species[name]["baseSpDefense"]
        const baseSpeed = species[name]["baseSpeed"]
        const BST = baseHP + baseAttack + baseDefense + baseSpAttack + baseSpDefense + baseSpeed

        species[name]["BST"] = BST

    }
    return species
}