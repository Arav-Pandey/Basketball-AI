import { useState } from "react";
import HalfCourt from "../assets/HalfCourt.png";
import Draggable from "../Dragging";
import ControlRight from "./ControlRight";
import ControlLeft from "./ControlLeft";
import { PiCircleDashedFill } from "react-icons/pi";
import LineDrawerCurve, { LineStart } from "./LineDrawerCurve";

export default function Playmaking() {
  const [teamPlayers, setTeamPlayers] = useState([{ id: 1 }]);
  const [opponentPlayers, setOpponentPlayers] = useState([{ id: 1 }]);
  const [basketballs, setBasketballs] = useState([{ id: 1 }]);
  const [shotSpots, setShotSpots] = useState<{ id: number }[]>([]);
  const [reset, setReset] = useState(false);
  const [removeLines, setRemoveLines] = useState(false);
  const [controlVis, setControlVis] = useState(true);
  const [pass, setPass] = useState(false);

  const onClickAddTeamPlayer = () => {
    const newPlayer = { id: teamPlayers.length + 1 };
    setTeamPlayers([...teamPlayers, newPlayer]);
  };

  const onClickAddOpponentPlayer = () => {
    const newPlayer = { id: teamPlayers.length + 1 };
    setOpponentPlayers([...opponentPlayers, newPlayer]);
  };

  const onAddBall = () => {
    const newBasketball = { id: basketballs.length + 1 };
    setBasketballs([...basketballs, newBasketball]);
  };

  const onReset = () => {
    setReset(true);
    setTeamPlayers([]);
    setOpponentPlayers([]);
    setBasketballs([]);
    setShotSpots([]);
    setTimeout(() => setReset(false), 100);
  };

  const removeTeamPlayer = () => {
    if (teamPlayers.length > 0) {
      setTeamPlayers(teamPlayers.slice(0, -1));
    }
  };

  const removeOpponentPlayer = () => {
    if (opponentPlayers.length > 0) {
      setOpponentPlayers(opponentPlayers.slice(0, -1));
    }
  };

  const removeBall = () => {
    if (basketballs.length > 0) {
      setBasketballs(basketballs.slice(0, -1));
    }
  };

  const removeLine = () => {
    setRemoveLines(true);
  };

  const addPair = () => {
    onClickAddTeamPlayer();
    onClickAddOpponentPlayer();
  };

  const onAddShotSpot = () => {
    const newShotSpot = { id: shotSpots.length + 1 };
    setShotSpots([...shotSpots, newShotSpot]);
  };

  const onRemoveShotSpot = () => {
    if (shotSpots.length > 0) {
      setShotSpots(shotSpots.slice(0, -1));
    }
  };

  const onLatestPass = () => {
    return pass;
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start gap-3 px-2 pt-3 sm:gap-6 sm:px-0 sm:pt-6">
      <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
        Playmaking
      </h1>
      <div className="flex w-full justify-center overflow-x-auto">
        <LineDrawerCurve
          reset={reset}
          removeLines={removeLines}
          setRemoveLines={setRemoveLines}
          onLatestPass={onLatestPass}
        >
          <div className="relative min-w-full sm:w-full">
            <img
              src={HalfCourt}
              alt="Half Court"
              className="mb-24 h-auto w-full sm:mb-40 lg:mb-60"
            />

            <div className="absolute left-4 sm:left-20 top-4 sm:top-20">
              {teamPlayers.map((player) => (
                <div className="ml-4 sm:ml-10" key={player.id}>
                  <Draggable key={player.id}>
                    <LineStart>
                      <span className="text-gray-400 text-lg sm:text-xl">
                        O
                      </span>
                    </LineStart>
                  </Draggable>
                </div>
              ))}
            </div>

            <div className="absolute left-16 sm:left-40 top-4 sm:top-20">
              {opponentPlayers.map((player) => (
                <div className="ml-4 sm:ml-10" key={player.id}>
                  <Draggable key={player.id}>
                    <LineStart>
                      <span className="text-gray-400 text-lg sm:text-xl">
                        X
                      </span>
                    </LineStart>
                  </Draggable>
                </div>
              ))}
            </div>
            <div className="absolute left-28 sm:left-60 top-4 sm:top-20">
              {basketballs.map((basketball) => (
                <div className="ml-4 sm:ml-10" key={basketball.id}>
                  <Draggable key={basketball.id}>
                    <LineStart>
                      <span className="text-lg sm:text-xl">🏀</span>
                    </LineStart>
                  </Draggable>
                </div>
              ))}
            </div>
            <div className="absolute left-40 sm:left-80 top-4 sm:top-20">
              {shotSpots.map((spot) => (
                <div className="ml-4 sm:ml-10" key={spot.id}>
                  <Draggable key={spot.id}>
                    <PiCircleDashedFill
                      fill="black"
                      size={20}
                      className="sm:w-10 sm:h-10"
                    />
                  </Draggable>
                </div>
              ))}
            </div>
          </div>
        </LineDrawerCurve>
      </div>

      <ControlRight
        onAddTeammate={() => onClickAddTeamPlayer()}
        onAddOpponent={() => onClickAddOpponentPlayer()}
        onAddBall={() => onAddBall()}
        onReset={() => onReset()}
        onRemoveTeammate={() => removeTeamPlayer()}
        onRemoveOpponent={() => removeOpponentPlayer()}
        onRemoveBall={() => removeBall()}
        onAddPair={() => addPair()}
        onRemoveLine={() => removeLine()}
        controlVis={controlVis}
        setControlVis={setControlVis}
      />
      <ControlLeft
        onAddShotSpot={() => onAddShotSpot()}
        onRemoveShotSpot={() => onRemoveShotSpot()}
        controlVis={controlVis}
        setControlVis={setControlVis}
        pass={pass}
        setPass={setPass}
      />
    </div>
  );
}
