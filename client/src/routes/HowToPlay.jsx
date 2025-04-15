import React from 'react';
import bomb from "../components/Images/icons/powerUps/bombPowerUp.png"
import steal from "../components/Images/icons/powerUps/stealPowerUp.png"
import twox from "../components/Images/icons/powerUps/2XPowerUp.png"
import threex from "../components/Images/icons/powerUps/3XPowerUp.png"
export const HowToPlay = () => {


  return (
    <div className="howToPlay">
      <header>How to Play</header>

      <div className='pageContent'>
        <main>
          <div className='mainInstructionsContainer'>
            <h3>Game Instructions</h3>
                
            <ol className='mainOl'>
              <li>Select to play against the computer (Random Player?) or an opponent online (Random Player?).</li>
              <li>Random player makes the first move in a new game.</li>
              <li>On your turn, the PowerUp machine will automatically roll. If you receive a PowerUp, select to play it or skip.</li>
              <li>Make your move by selecting a tile (a value will be shown). The higher the value, the more points you collect.</li>
              <li>The goal is to connect a minimum of 3 tiles in a row. The more tiles you connect, the more points you collect.</li>
              <li>Once you connect a minimum of 3 tiles, your total tile points is multiplied by the number of tiles you have in a row. For example: You have 3 tiles valued at 4, 3, and 2 = 9, 9 point x 3 tiles = 27.</li>
              <li>The first player to collect 40 points is the winner.</li>
              <li>If a player takes longer than 10 minutes to make a move, they automatically forfeit the game.</li>
            </ol>

            <button className='mainButton'>START A GAME</button>
          </div>
            
        </main>

        <aside>
          <div className='powerUpAside'>
            <h3>PowerUps</h3>

            <p>A PowerUp Booster is automatically given once a day.  It allows a player to have a higher chance of winning a specific power up on every spin for one game. Example: If you buy a bomb power up booster, the chances of winning that bomb on every spin goes from 1:12 to 1:6 chance. You are limited to 1 PowerUp Booster per game.</p>
          
            <div>
              <div className='icon'>
                <img src={bomb}/>
              </div>
              <p><span className='powerUpTitle'>Bomb:</span> Blow up your opponent's tile, including another connected tile.</p> 
            </div>

            <div>
              <div className='icon'>
                <img src={steal}/>
              </div>
              <p><span className='powerUpTitle'>Steal:</span> Take a tile from your opponent, or can be used to remove a fortify, 2x or 3x</p> 
            </div>

            <div>
              <div className='icon'>
                <img src={twox}/>
              </div>
              <p><span className='powerUpTitle'>2x:</span> Double your points on your tile selection. Can be removed by a bomb or steal.</p> 
            </div> 

            <div>
              <div className='icon'>
                <img src={threex}/>
              </div>
              <p><span className='powerUpTitle'>3x:</span> Triple your points on your tile selection. Can be removed by a bomb or steal.</p> 
            </div>
          </div>

          <div className='subscriptionAside'>
            <p>Need More PowerUps?</p>
            <p>Recieve a higher-level Powerup when you send an invitation to your friends and they join the game.</p>
            <br />
            <p>Subscribe now and receive monthly rewards.</p>
            <br /> 
            <p>Visit our store to see all your options for the ultimate game challenge.</p>
            <br />
            <button>get powerups</button>
          </div>
        </aside>
      </div>   
      
    </div>
  );
};
