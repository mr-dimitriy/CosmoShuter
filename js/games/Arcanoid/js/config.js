
export const gameConfig = {
    canvas: {
        width: 1000,
        height: 900
    },
    
    paddle:{
        paddleHeight: 15,
        paddleWidth: 120
    },
    
    score: {
        initialMultiplier: 1,
        multiplierGrowth: 1.5
    },

    blocksType: [
        {
            name: 'simple',
            sizeWidth: 6,
            sizeHeight: 3,
            points: 5
        }
    ],

    // bonusType: [
    //     {
    //         name: 'simple',
    //         sizeWidth: 6,
    //         sizeHeight: 3
    //     }
    // ],
};