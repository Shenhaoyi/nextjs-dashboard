'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // URLSearchParams的只读版本的实例，上面有迭代器
  const pathname = usePathname();
  const { replace } = useRouter();

  const urlSearchParams = new URLSearchParams(searchParams);
  const defaultValue = urlSearchParams.get('search') || '';

  const handleChange = (e: Record<string, any>) => {
    const search = e.target.value;
    if (search) urlSearchParams.set('search', search);
    else urlSearchParams.delete('search');
    replace(`${pathname}?${urlSearchParams.toString()}`);
  };
  const debounceHandleChange = debounce(handleChange, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={debounceHandleChange}
        defaultValue={defaultValue}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
