import { MonthlyStats } from '@/types/monthly';
import { MonthlyService } from '@/services/monthlyService';

interface MonthlyStatsProps {
  stats: MonthlyStats;
  targetPemasukanBulan: number;
}

export default function MonthlyStatsComponent({ stats, targetPemasukanBulan }: MonthlyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Iuran Terkumpul */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Iuran Terkumpul</p>
            <p className="text-2xl font-bold text-blue-600">
              {MonthlyService.formatCurrency(stats.totalIuranTerkumpul)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Anggota Lunas */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Anggota Lunas</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalAnggotaLunas}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Anggota Kurang Bayar */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Anggota Kurang Bayar</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.totalAnggotaKurang}
            </p>
            <p className="text-sm text-red-500">
              Total: {MonthlyService.formatCurrency(stats.totalKekurangan)}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Anggota Lebih Bayar */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Anggota Lebih Bayar</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.totalAnggotaLebih}
            </p>
            <p className="text-sm text-yellow-600">
              Total: {MonthlyService.formatCurrency(stats.totalKelebihan)}
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Target vs Aktual */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500 md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Target vs Aktual</p>
            <div className="flex items-center space-x-4 mt-2">
              <div>
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-lg font-bold text-purple-600">
                  {MonthlyService.formatCurrency(targetPemasukanBulan)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktual</p>
                <p className="text-lg font-bold text-purple-600">
                  {MonthlyService.formatCurrency(stats.totalIuranTerkumpul)}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (stats.totalIuranTerkumpul / targetPemasukanBulan) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.totalIuranTerkumpul / targetPemasukanBulan) * 100).toFixed(1)}% tercapai
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
