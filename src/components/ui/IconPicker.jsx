// src/components/ui/IconPicker.jsx
import React from 'react';
import * as Icons from '../Icons'; // Import tất cả các icon

// Lấy danh sách tên các icon có sẵn, loại bỏ các icon không cần thiết
const availableIcons = Object.keys(Icons).filter(
  key => key.endsWith('Icon') && !['ThumbsUpIcon', 'ThumbsDownIcon', 'PlusIcon'].includes(key)
);

const IconPicker = ({ selectedIcon, onSelectIcon }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chọn Icon *</label>
      <div className="mt-2 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {availableIcons.map(iconName => {
          const IconComponent = Icons[iconName];
          const isSelected = selectedIcon === iconName;
          
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelectIcon(iconName)}
              className={`flex items-center justify-center p-3 rounded-lg border-2 transition-transform hover:scale-110 ${isSelected ? 'border-amber-500 bg-amber-100 dark:bg-amber-500/20' : 'border-slate-200 dark:border-slate-600'}`}
              title={iconName.replace('Icon', '')}
            >
              <IconComponent />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconPicker;
