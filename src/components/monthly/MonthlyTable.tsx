import { AnggotaMonthly } from '@/types/monthly';
import { MonthlyService } from '@/services/monthlyService';

interface MonthlyTableProps {
  data: AnggotaMonthly[];
  targetPerAnggota: number;
}

export default function MonthlyTable({ data, targetPerAnggota }: MonthlyTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Lunas
          </span>
        );
      case 'kurang':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ⚠ Kurang
          </span>
        );
      case 'lebih':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            + Lebih
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anggota
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sisa Bulan Lalu
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Iuran Bulan Ini
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Terbayar
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ke Bulan Depan
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress Periode
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((anggota) => (
              <tr key={anggota.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {anggota.nickname.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {anggota.nama}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{anggota.nickname}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`font-medium ${
                    anggota.sisaSebelumnya > 0 
                      ? 'text-green-600' 
                      : anggota.sisaSebelumnya < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {anggota.sisaSebelumnya > 0 && '+'}
                    {MonthlyService.formatCurrency(anggota.sisaSebelumnya)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className="font-medium text-blue-600">
                    {MonthlyService.formatCurrency(anggota.iuranBulanIni)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className="font-semibold text-gray-900">
                    {MonthlyService.formatCurrency(anggota.totalTerbayar)}
                  </span>
                  <div className="text-xs text-gray-500">
                    dari {MonthlyService.formatCurrency(targetPerAnggota)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(anggota.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`font-medium ${
                    anggota.keSisaBerikutnya > 0 
                      ? 'text-green-600' 
                      : anggota.keSisaBerikutnya < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {anggota.keSisaBerikutnya > 0 && '+'}
                    {MonthlyService.formatCurrency(anggota.keSisaBerikutnya)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (anggota.progressToTarget || 0) >= 100 ? 'bg-green-500' : 
                          (anggota.progressToTarget || 0) >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, anggota.progressToTarget || 0)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      (anggota.progressToTarget || 0) >= 100 ? 'text-green-600' : 
                      (anggota.progressToTarget || 0) >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {anggota.progressToTarget || 0}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {MonthlyService.formatCurrency(anggota.totalIuranFromStart || 0)} / {MonthlyService.formatCurrency(anggota.targetIuranSampaiSekarang || 0)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-3 text-sm font-bold text-gray-900">
                Total ({data.length} anggota)
              </td>
              <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                {MonthlyService.formatCurrency(
                  data.reduce((sum, a) => sum + a.sisaSebelumnya, 0)
                )}
              </td>
              <td className="px-6 py-3 text-sm text-right font-bold text-blue-600">
                {MonthlyService.formatCurrency(
                  data.reduce((sum, a) => sum + a.iuranBulanIni, 0)
                )}
              </td>
              <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                {MonthlyService.formatCurrency(
                  data.reduce((sum, a) => sum + a.totalTerbayar, 0)
                )}
              </td>
              <td className="px-6 py-3 text-sm text-center font-bold text-gray-900">
                -
              </td>
              <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                {MonthlyService.formatCurrency(
                  data.reduce((sum, a) => sum + a.keSisaBerikutnya, 0)
                )}
              </td>
              <td className="px-6 py-3 text-sm text-center font-bold text-gray-900">
                {Math.round(
                  data.reduce((sum, a) => sum + (a.progressToTarget || 0), 0) / data.length
                )}% avg
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
