import { createElement, icons } from 'lucide';

function resolveIcon(name) {
    if (icons[name]) return icons[name];
    const pascal = name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    return icons[pascal];
}

export function icon(name, options = {}) {
    const { size = 18, className = 'inline-icon', strokeWidth = 2 } = options;
    const iconNode = resolveIcon(name);
    if (!iconNode) return '';
    const el = createElement(iconNode, {
        width: size,
        height: size,
        class: className,
        'stroke-width': strokeWidth,
    });
    return el.outerHTML;
}

export function iconText(name, text, options = {}) {
    const size = options.size || 16;
    const cls = options.className || 'inline-icon';
    return `<span class="icon-text">${icon(name, { size, className: cls })}<span>${text}</span></span>`;
}
