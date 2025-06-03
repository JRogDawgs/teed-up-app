import { View, Text, ScrollView } from 'react-native';
import { PlayerScore } from '../types/game';

interface ScorecardProps {
  playerScores: Record<string, PlayerScore>;
  currentHole?: number;
}

export default function Scorecard({ playerScores, currentHole }: ScorecardProps) {
  const renderHoleHeader = () => (
    <View className="flex-row border-b border-gray-200">
      <View className="w-24 p-2 sticky left-0 bg-white z-10">
        <Text className="font-semibold">Player</Text>
      </View>
      {/* Front 9 */}
      {Array.from({ length: 9 }, (_, i) => (
        <View key={`front-${i}`} className="w-12 p-2 items-center">
          <Text className="font-semibold">{i + 1}</Text>
        </View>
      ))}
      <View className="w-12 p-2 items-center bg-gray-50">
        <Text className="font-semibold">Out</Text>
      </View>
      {/* Back 9 */}
      {Array.from({ length: 9 }, (_, i) => (
        <View key={`back-${i}`} className="w-12 p-2 items-center">
          <Text className="font-semibold">{i + 10}</Text>
        </View>
      ))}
      <View className="w-12 p-2 items-center bg-gray-50">
        <Text className="font-semibold">In</Text>
      </View>
      <View className="w-12 p-2 items-center bg-masters-green/10">
        <Text className="font-semibold">Total</Text>
      </View>
    </View>
  );

  const renderPlayerRow = (playerId: string, scores: PlayerScore) => (
    <View key={playerId} className="flex-row border-b border-gray-200">
      <View className="w-24 p-2 sticky left-0 bg-white z-10">
        <Text className="font-medium">{playerId}</Text>
      </View>
      {/* Front 9 Scores */}
      {scores.scores.slice(0, 9).map((score, index) => (
        <View
          key={`front-score-${index}`}
          className={`w-12 p-2 items-center ${
            currentHole === index + 1 ? 'bg-masters-green/10' : ''
          }`}
        >
          <Text
            className={`${
              score.scoreType === 'Birdie'
                ? 'text-green-600'
                : score.scoreType === 'Eagle'
                ? 'text-blue-600'
                : score.scoreType === 'Bogey'
                ? 'text-red-600'
                : 'text-gray-800'
            }`}
          >
            {score.score}
          </Text>
        </View>
      ))}
      <View className="w-12 p-2 items-center bg-gray-50">
        <Text className="font-semibold">{scores.frontNine}</Text>
      </View>
      {/* Back 9 Scores */}
      {scores.scores.slice(9, 18).map((score, index) => (
        <View
          key={`back-score-${index}`}
          className={`w-12 p-2 items-center ${
            currentHole === index + 10 ? 'bg-masters-green/10' : ''
          }`}
        >
          <Text
            className={`${
              score.scoreType === 'Birdie'
                ? 'text-green-600'
                : score.scoreType === 'Eagle'
                ? 'text-blue-600'
                : score.scoreType === 'Bogey'
                ? 'text-red-600'
                : 'text-gray-800'
            }`}
          >
            {score.score}
          </Text>
        </View>
      ))}
      <View className="w-12 p-2 items-center bg-gray-50">
        <Text className="font-semibold">{scores.backNine}</Text>
      </View>
      <View className="w-12 p-2 items-center bg-masters-green/10">
        <Text className="font-semibold">{scores.totalScore}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView horizontal className="flex-1">
      <View className="min-w-full">
        {renderHoleHeader()}
        {Object.entries(playerScores).map(([playerId, scores]) =>
          renderPlayerRow(playerId, scores)
        )}
      </View>
    </ScrollView>
  );
} 