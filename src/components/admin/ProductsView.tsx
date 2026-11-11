/**
 * Products Management View matching Screenshot 2 (٢٠٢٦١٠٢٧_٢٠٠٨٠١.jpg)
 */
import React, { useState } from 'react';
import {
  FolderPlus,
  FolderEdit,
  FolderMinus,
  Plus,
  Edit2,
  Trash2,
  Printer,
  FileText,
  Hash,
  ArrowUpDown,
  BarChart2,
  Upload,
  Download,
  FileCode,
  HelpCircle,
  X,
  Search,
  Folder,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Product } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { StorageService } from '../../services/storage';
import { ConfirmModal } from '../common/ConfirmModal';

interface ProductsViewProps {
  products: Product[];
  categories: string[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onOpenBarcodeLabels: () => void;
  onAddCategory: (categoryName: string) => void;
  currencySymbol: string;
  onRefreshData?: () => void;
  onClearAllProducts?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  onSaveProduct,
  onDeleteProduct,
  onOpenBarcodeLabels,
  onAddCategory,
  currencySymbol,
  onRefreshData,
  onClearAllProducts,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products.length > 0 ? products[0].id : null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchName, setSearchName] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0] || 'ساعات');
  const [formCost, setFormCost] = useState('0.00');
  const [formSalePrice, setFormSalePrice] = useState('80.00');
  const [formTaxRate, setFormTaxRate] = useState('15');
  const [formStock, setFormStock] = useState('20');
  const [formUnit, setFormUnit] = useState('حبة');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const q = searchName.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId) || filteredProducts[0] || null;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCode('P-' + Math.floor(100 + Math.random() * 900));
    setFormBarcode(Math.floor(1000000 + Math.random() * 9000000).toString());
    setFormCategory(selectedCategory || categories[0] || 'ساعات');
    setFormCost('0.00');
    setFormSalePrice('80.00');
    setFormTaxRate('15');
    setFormStock('25');
    setFormUnit('حبة');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCode(p.code);
    setFormBarcode(p.barcode);
    setFormCategory(p.category);
    setFormCost(p.costPrice.toString());
    setFormSalePrice(p.salePrice.toString());
    setFormTaxRate(p.taxRate.toString());
    setFormStock(p.stock.toString());
    setFormUnit(p.unit);
    setIsEditModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const saved: Product = {
      id: editingProduct ? editingProduct.id : 'p_' + Date.now(),
      name: formName.trim(),
      code: formCode.trim() || 'P-' + Math.floor(100 + Math.random() * 900),
      barcode: formBarcode.trim() || Math.floor(100000 + Math.random() * 900000).toString(),
      category: formCategory.trim(),
      costPrice: parseFloat(formCost) || 0,
      salePrice: parseFloat(formSalePrice) || 0,
      taxRate: parseFloat(formTaxRate) || 15,
      stock: parseInt(formStock) || 0,
      unit: formUnit.trim() || 'حبة',
      image: editingProduct?.image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&auto=format&fit=crop&q=80',
    };

    onSaveProduct(saved);
    setIsEditModalOpen(false);
  };

  // Non-blocking Modals State
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    name: string;
  }>({
    isOpen: false,
    mode: 'add',
    name: '',
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleCreateNewGroup = () => {
    setCategoryModal({
      isOpen: true,
      mode: 'add',
      name: '',
    });
  };

  const handleEditGroup = () => {
    if (selectedCategory) {
      setCategoryModal({
        isOpen: true,
        mode: 'edit',
        name: selectedCategory,
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'تحديد مجموعة أولاً',
        message: 'يرجى النقر على اسم مجموعة من القائمة الجانبية لتعديلها.',
        confirmText: 'حسناً',
        isDanger: false,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleDeleteGroupClick = () => {
    if (!selectedCategory) return;
    setConfirmModal({
      isOpen: true,
      title: 'إلغاء تصفية المجموعة',
      message: `هل تود إلغاء تصفية المجموعة "${selectedCategory}" والعودة لعرض كافة الأصناف؟`,
      confirmText: 'نعم، عرض الكل',
      isDanger: false,
      onConfirm: () => {
        setSelectedCategory(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteProductClick = () => {
    if (!selectedProduct) return;
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد حذف الصنف',
      message: `هل أنت متأكد من حذف المنتج "${selectedProduct.name}" (كود: ${selectedProduct.code})؟\nلن يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'نعم، حذف المنتج',
      isDanger: true,
      onConfirm: () => {
        onDeleteProduct(selectedProduct.id);
        setSelectedProductId(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleClearAllProductsClick = () => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد حذف وتصفير كافة الأصناف والمخزون',
      message: 'هل أنت متأكد من حذف وتصفير جميع الأصناف والمخزونات في المتجر؟ لن يمكن التراجع وسيبدأ النظام فارغاً لإدخال أصنافك الجديدة.',
      confirmText: 'نعم، تصفير وحذف الكل',
      isDanger: true,
      onConfirm: () => {
        if (onClearAllProducts) {
          onClearAllProducts();
        }
        setSelectedProductId(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]">
      {/* Top Action Toolbar matching Screenshot 2 EXACTLY */}
      <div className="h-14 bg-[#20242b] border-b border-[#2e333d] flex items-center justify-between px-3 text-xs overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 shrink-0">
          {/* مجموعة جديدة */}
          <button
            onClick={handleCreateNewGroup}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] active:bg-[#343b46] rounded transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="إضافة مجموعة / تصنيف جديد"
          >
            <FolderPlus size={17} className="text-amber-400" />
            <span className="text-[10px] mt-0.5">مجموعة جديدة</span>
          </button>

          {/* تحرير المجموعة */}
          <button
            onClick={handleEditGroup}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="تحرير المجموعة المحددة"
          >
            <FolderEdit size={17} className="text-cyan-400" />
            <span className="text-[10px] mt-0.5">تحرير المجموعة</span>
          </button>

          {/* حذف المجموعة */}
          <button
            onClick={handleDeleteGroupClick}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-rose-400"
            title="إلغاء تصفية المجموعة"
          >
            <FolderMinus size={17} className="text-rose-400" />
            <span className="text-[10px] mt-0.5">إلغاء التصفية</span>
          </button>

          <span className="h-7 w-[1px] bg-[#333742] mx-1" />

          {/* منتج جديد */}
          <button
            onClick={handleOpenAdd}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-emerald-400"
            title="إضافة صنف / منتج جديد"
          >
            <Plus size={18} className="text-emerald-400" />
            <span className="text-[10px] mt-0.5">منتج جديد</span>
          </button>

          {/* تحرير المنتج */}
          <button
            onClick={() => {
              if (selectedProduct) handleOpenEdit(selectedProduct);
            }}
            disabled={!selectedProduct}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-cyan-400 disabled:opacity-40"
            title="تحرير بيانات المنتج المحدد"
          >
            <Edit2 size={16} className="text-cyan-400" />
            <span className="text-[10px] mt-0.5">تحرير المنتج</span>
          </button>

          {/* حذف المنتج */}
          <button
            onClick={handleDeleteProductClick}
            disabled={!selectedProduct}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-rose-400 disabled:opacity-40"
            title="حذف المنتج المحدد"
          >
            <Trash2 size={16} className="text-rose-400" />
            <span className="text-[10px] mt-0.5">حذف المنتج</span>
          </button>

          <span className="h-7 w-[1px] bg-[#333742] mx-1" />

          {/* طباعة */}
          <button
            onClick={() => window.print()}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="طباعة قائمة المنتجات"
          >
            <Printer size={16} className="text-gray-300" />
            <span className="text-[10px] mt-0.5">طباعة</span>
          </button>

          {/* حفظ PDF */}
          <button
            onClick={() => window.print()}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="تصدير كملف PDF"
          >
            <FileText size={16} className="text-gray-300" />
            <span className="text-[10px] mt-0.5">حفظ PDF</span>
          </button>

          {/* # بطاقات الأسعار (EXACT Button from Screenshot 2 opening Screenshot 1) */}
          <button
            onClick={onOpenBarcodeLabels}
            className="flex flex-col items-center justify-center px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/60 rounded transition-colors cursor-pointer text-cyan-300 font-bold"
            title="طباعة وتصميم بطاقات الأسعار والباركود"
          >
            <Hash size={17} className="text-cyan-400" />
            <span className="text-[10px] mt-0.5"># بطاقات الأسعار</span>
          </button>

          {/* Sorting */}
          <button
            onClick={() => {}}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="ترتيب الأصناف"
          >
            <ArrowUpDown size={16} className="text-gray-400" />
            <span className="text-[10px] mt-0.5">Sorting</span>
          </button>

          {/* Mov. avg. price */}
          <button
            onClick={() => alert('متوسط التكلفة المتحركة محسوب ومحدث وفقاً لحركات المشتريات.')}
            className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#2c313a] rounded transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="متوسط الأسعار المتحرك"
          >
            <BarChart2 size={16} className="text-gray-400" />
            <span className="text-[10px] mt-0.5">Mov. avg. price</span>
          </button>
        </div>

        {/* Right Secondary Actions (تصدير واستيراد JSON، تصدير CSV، مساعدة) */}
        <div className="flex items-center gap-1.5">
          {/* تصدير JSON */}
          <button
            onClick={() => {
              try {
                const filename = StorageService.downloadProductsFile();
                alert(`تم تصدير وحفظ ملف المنتجات بنجاح:\n${filename}`);
              } catch (e: any) {
                alert('فشل في تصدير المنتجات: ' + e?.message);
              }
            }}
            className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white px-2 py-1 rounded bg-[#202733] hover:bg-[#2b3547] border border-cyan-800/40 transition-colors cursor-pointer"
            title="تصدير جميع المنتجات وقائمة الأسعار كملف JSON محلي"
          >
            <Download size={13} className="text-cyan-400" />
            <span>تصدير JSON</span>
          </button>

          {/* استيراد JSON */}
          <label
            className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white px-2 py-1 rounded bg-[#1e2a22] hover:bg-[#283b30] border border-emerald-800/40 transition-colors cursor-pointer"
            title="استيراد وتحديث المنتجات من ملف JSON"
          >
            <Upload size={13} className="text-emerald-400" />
            <span>استيراد JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                e.target.value = '';
                if (window.confirm(`هل أنت متأكد من استيراد قائمة الأصناف من الملف (${file.name})؟`)) {
                  const res = await StorageService.importFromJsonFile(file, { mode: 'merge' });
                  if (res.success) {
                    alert(res.message);
                    if (onRefreshData) onRefreshData();
                  } else {
                    alert(res.message);
                  }
                }
              }}
            />
          </label>

          {/* تصدير CSV */}
          <button
            onClick={() => {
              const csv = products.map((p) => `${p.id},${p.name},${p.category},${p.barcode},${p.salePrice}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Hajayer_Products.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-[#282d36] transition-colors cursor-pointer"
            title="تصدير جدول المنتجات كملف CSV للإكسيل"
          >
            <Upload size={13} className="rotate-180" />
            <span>CSV</span>
          </button>

          <button
            onClick={() =>
              setConfirmModal({
                isOpen: true,
                title: 'دليل مساعدة إدارة المنتجات',
                message:
                  '• يمكنك البحث المباشر باسم المنتج أو الباركود أو الكود في حقل البحث.\n• استخدم "تصدير JSON" لأخذ نسخة احتياطية من جميع المنتجات.\n• زر "# بطاقات الأسعار" يتيح تصميم وطباعة ملصقات الباركود والأسعار للطابعات الحرارية.',
                confirmText: 'حسناً',
                isDanger: false,
                onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
              })
            }
            className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-[#282d36] transition-colors cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>مساعدة</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Category Tree + Right Table (Matching Screenshot 2) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Category Folder Tree */}
        <aside className="w-48 bg-[#1a1c22] border-l border-[#2e333d] flex flex-col p-2 space-y-1 select-none overflow-y-auto">
          <div className="text-[10px] text-gray-400 px-2 py-1 font-bold">المجموعات والتصنيفات:</div>

          {/* Root Group: منتجات */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === null
                ? 'bg-cyan-700 text-white'
                : 'text-gray-300 hover:bg-[#23272f] hover:text-white'
            }`}
          >
            <Folder size={15} className={selectedCategory === null ? 'text-white' : 'text-cyan-400'} />
            <span>منتجات (الكل)</span>
          </button>

          {/* Sub Categories */}
          <div className="mr-3 space-y-0.5 border-r border-[#2e333d] pr-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer text-right ${
                    isSelected
                      ? 'bg-[#283241] text-cyan-300 font-bold border-r-2 border-cyan-400'
                      : 'text-gray-400 hover:bg-[#20242b] hover:text-gray-200'
                  }`}
                >
                  <Folder size={14} className={isSelected ? 'text-cyan-400' : 'text-amber-400'} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Table Area */}
        <main className="flex-1 flex flex-col bg-[#14161a] overflow-hidden">
          {/* Sub Toolbar matching Screenshot 2 */}
          <div className="h-10 bg-[#1e2229] border-b border-[#2e333d] flex items-center justify-between px-3 text-xs">
            {/* Filter icons: * | ||||| | # | Tag | Search */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-l border-[#31363f] pl-2">
                <button
                  onClick={() => {
                    setSearchName('');
                    setSelectedCategory(null);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded bg-[#272c36] hover:bg-[#323946] text-gray-300 font-bold cursor-pointer"
                  title="عرض الكل وتصفير الفلاتر"
                >
                  *
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('products-admin-search') as HTMLInputElement;
                    if (el) {
                      el.focus();
                      el.select();
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded bg-[#272c36] hover:bg-[#323946] text-cyan-400 font-mono text-[11px] cursor-pointer"
                  title="البحث بالباركود"
                >
                  |||
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('products-admin-search') as HTMLInputElement;
                    if (el) {
                      el.focus();
                      el.select();
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded bg-[#272c36] hover:bg-[#323946] text-amber-400 text-[11px] cursor-pointer"
                  title="البحث بالكود"
                >
                  #
                </button>
              </div>

              {/* Search input with label 'اسم الصنف' */}
              <div className="relative w-64">
                <input
                  id="products-admin-search"
                  type="text"
                  placeholder="اسم الصنف أو الباركود أو الكود..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full h-7 bg-[#15171b] border border-[#383e4a] rounded px-2 pr-7 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Total Products Counter matching Screenshot 2: عدد المنتجات: 504 */}
            <div className="font-mono text-xs text-gray-300">
              عدد المنتجات: <strong className="text-cyan-400 font-bold">{504 + products.length - 14}</strong>
            </div>
          </div>

          {/* Table matching Screenshot 2 Columns: [ID] [اسم] [مجموعة] [باركود] [كلفة] [سعر البيع] [الضرائب] */}
          <div className="flex-1 overflow-auto bg-[#14161a]">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-[#1b1e24] text-gray-300 sticky top-0 border-b-2 border-cyan-500/80 z-10 font-bold">
                <tr>
                  <th className="p-2.5 w-16">ID</th>
                  <th className="p-2.5">اسم</th>
                  <th className="p-2.5">مجموعة</th>
                  <th className="p-2.5 font-mono">باركود</th>
                  <th className="p-2.5 text-left font-mono">كلفة</th>
                  <th className="p-2.5 text-left font-mono">سعر البيع</th>
                  <th className="p-2.5 text-center font-mono">الضرائب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232730]">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct && selectedProduct.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      onDoubleClick={() => handleOpenEdit(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#263140] text-white font-bold'
                          : 'hover:bg-[#1a1d23] text-gray-300'
                      }`}
                    >
                      <td className="p-2.5 font-mono text-cyan-400">{p.id}</td>
                      <td className="p-2.5 font-semibold text-white">{p.name}</td>
                      <td className="p-2.5 text-gray-300">
                        <span className="bg-[#242933] px-2 py-0.5 rounded text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-gray-400">{p.barcode}</td>
                      <td className="p-2.5 text-left font-mono text-gray-400">
                        {formatNumber(p.costPrice)}
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-emerald-400">
                        {formatNumber(p.salePrice)}
                      </td>
                      <td className="p-2.5 text-center font-mono text-cyan-300">
                        {p.taxRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Edit/Add Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
          <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1d22] border-b border-[#31363f]">
              <h2 className="font-bold text-base text-white">
                {editingProduct ? 'تحرير بيانات المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
                  placeholder="مثال: ساعة نسائي سهرة"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">المجموعة / القسم</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">الباركود *</label>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">كلفة الشراء</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">سعر البيع *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#2e333d]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 bg-[#282d36] hover:bg-[#333944] text-xs font-semibold rounded text-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  <span>حفظ المنتج</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      {categoryModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-['Cairo',sans-serif]"
          dir="rtl"
        >
          <div className="bg-[#20242b] border border-[#3b414d] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 bg-[#17191d] border-b border-[#2e333d]">
              <h3 className="font-bold text-sm text-white">
                {categoryModal.mode === 'add' ? 'إضافة مجموعة جديدة' : 'تعديل اسم المجموعة'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (categoryModal.name.trim()) {
                  onAddCategory(categoryModal.name.trim());
                  setSelectedCategory(categoryModal.name.trim());
                  setCategoryModal((prev) => ({ ...prev, isOpen: false }));
                }
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-xs text-gray-300 mb-1.5 font-medium">اسم المجموعة / القسم</label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={categoryModal.name}
                  onChange={(e) => setCategoryModal((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: مشروبات ساخنة، ملابس، إلكترونيات..."
                  className="w-full bg-[#15171b] border border-[#3c4352] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e333d]">
                <button
                  type="button"
                  onClick={() => setCategoryModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3.5 py-1.5 bg-[#2a2f3a] hover:bg-[#343a47] text-gray-300 text-xs rounded transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow transition-colors cursor-pointer"
                >
                  حفظ المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'تأكيد'}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
