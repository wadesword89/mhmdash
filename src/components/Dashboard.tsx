import { Header } from './Header';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <div className="flex-1 p-3 sm:p-6">
          <div>Map</div> 
          <div>Card</div>
        </div>
      </div>
    </div>
  );
}
